'use strict';
/**
 * MockModel — Drop-in replacement pour les modèles Mongoose.
 * Implémente l'API utilisée par les controllers :
 *   find / findOne / findById / findOneAndUpdate / findByIdAndUpdate
 *   findByIdAndDelete / create / countDocuments / aggregate
 *   + chaînage : .populate() .sort() .limit() .skip() .select() .lean()
 *   + instance.save() / instance.populate()
 *
 * Aucun changement requis dans controllers/services/models lorsque MongoDB
 * est disponible — server.js gère le basculement automatiquement.
 */

// Référence partagée entre tous les modèles pour les .populate()
let _allStores = {};

function setAllStores(stores) {
  _allStores = stores;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 1;
function generateId() {
  return `mock_${Date.now()}_${_idCounter++}`;
}

/** Correspondance simple doc ↔ filtre Mongoose */
function matches(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  return Object.entries(filter).every(([key, value]) => {
    const docVal = key === '_id' ? String(doc._id) : doc[key];
    if (value === null || value === undefined) return docVal == null;
    if (typeof value !== 'object' || Array.isArray(value)) {
      return String(docVal) === String(value);
    }
    // Opérateurs Mongoose : $in, $ne, $exists, $gte, $lte, $gt, $lt, $ne, $regex
    if ('$in'     in value) return value.$in.some(v => String(docVal) === String(v));
    if ('$nin'    in value) return !value.$nin.some(v => String(docVal) === String(v));
    if ('$ne'     in value) return String(docVal) !== String(value.$ne);
    if ('$exists' in value) return value.$exists ? docVal !== undefined : docVal === undefined;
    if ('$regex'  in value) return new RegExp(value.$regex, value.$options || 'i').test(docVal);
    if ('$gte'    in value || '$lte' in value || '$gt' in value || '$lt' in value) {
      const d = new Date(docVal).getTime();
      if ('$gte' in value && d < new Date(value.$gte).getTime()) return false;
      if ('$lte' in value && d > new Date(value.$lte).getTime()) return false;
      if ('$gt'  in value && d <= new Date(value.$gt).getTime())  return false;
      if ('$lt'  in value && d >= new Date(value.$lt).getTime())  return false;
      return true;
    }
    return false;
  });
}

/** Résout un ObjectId (string) vers le doc référencé dans n'importe quel store */
function resolveRef(id) {
  if (!id) return null;
  const sid = String(id);
  for (const store of Object.values(_allStores)) {
    const found = store.find(d => String(d._id) === sid);
    if (found) return JSON.parse(JSON.stringify(found));
  }
  return null;
}

/** Applique populate (field, select) sur un document cloné */
function applyPopulate(doc, field, select) {
  if (!doc || !doc[field]) return doc;
  const ref = resolveRef(doc[field]);
  if (!ref) return doc;
  if (select) {
    const parts  = select.split(' ');
    const incl   = parts.filter(p => !p.startsWith('-'));
    const excl   = parts.filter(p =>  p.startsWith('-')).map(p => p.slice(1));
    if (incl.length) {
      const kept = { _id: ref._id };
      incl.forEach(f => { if (f in ref) kept[f] = ref[f]; });
      doc[field] = kept;
    } else {
      excl.forEach(f => delete ref[f]);
      doc[field] = ref;
    }
  } else {
    doc[field] = ref;
  }
  return doc;
}

// ─── MockQuery — chaînable, thenable ─────────────────────────────────────────

class MockQuery {
  constructor(docs, single = false, modelRef = null) {
    this._docs    = Array.isArray(docs) ? docs : (docs ? [docs] : []);
    this._single  = single;   // findOne / findById → retourne un seul doc
    this._modelRef = modelRef;
    this._pops    = [];       // [{ field, select }]
    this._sortOpt = null;
    this._limitN  = null;
    this._skipN   = null;
    this._selects = null;
  }

  populate(field, select) {
    this._pops.push({ field, select: select || null });
    return this;
  }

  sort(opt) {
    this._sortOpt = opt;
    return this;
  }

  limit(n) {
    this._limitN = Number(n);
    return this;
  }

  skip(n) {
    this._skipN = Number(n);
    return this;
  }

  select(fields) {
    this._selects = fields;
    return this;
  }

  lean() { return this; }

  exec() { return this._resolve(); }

  then(onFulfilled, onRejected) {
    return this._resolve().then(onFulfilled, onRejected);
  }
  catch(onRejected) {
    return this._resolve().catch(onRejected);
  }

  async _resolve() {
    let docs = JSON.parse(JSON.stringify(this._docs));

    // Sort
    if (this._sortOpt) {
      const entries = typeof this._sortOpt === 'string'
        ? [[this._sortOpt.replace(/^-/, ''), this._sortOpt.startsWith('-') ? -1 : 1]]
        : Object.entries(this._sortOpt);
      docs.sort((a, b) => {
        for (const [k, dir] of entries) {
          const av = a[k], bv = b[k];
          if (av == null && bv == null) continue;
          const cmp = av > bv ? 1 : av < bv ? -1 : 0;
          if (cmp !== 0) return cmp * (dir < 0 ? -1 : 1);
        }
        return 0;
      });
    }

    // Skip / Limit
    if (this._skipN)  docs = docs.slice(this._skipN);
    if (this._limitN) docs = docs.slice(0, this._limitN);

    // Populate
    for (const { field, select } of this._pops) {
      docs = docs.map(doc => applyPopulate(doc, field, select));
    }

    // Select (-passwordHash etc.)
    if (this._selects) {
      const excl = this._selects.split(' ').filter(f => f.startsWith('-')).map(f => f.slice(1));
      if (excl.length) docs = docs.map(d => { const c = { ...d }; excl.forEach(f => delete c[f]); return c; });
    }

    if (this._single) {
      const raw = docs[0] || null;
      if (!raw) return null;
      // Retourne une MockModelInstance si on a la référence du modèle
      return this._modelRef ? new MockModelInstance(raw, this._modelRef) : raw;
    }
    return docs;
  }
}

// ─── MockModelInstance (new Model(data)) ──────────────────────────────────────

class MockModelInstance {
  constructor(data, modelRef) {
    Object.assign(this, { _id: generateId(), createdAt: new Date().toISOString(), ...data });
    Object.defineProperty(this, '__modelRef', { value: modelRef, enumerable: false });
  }

  async save() {
    const store = this.__modelRef._store;
    const idx   = store.findIndex(d => String(d._id) === String(this._id));
    const plain = Object.assign({}, this);
    if (idx >= 0) store[idx] = plain; else store.push(plain);
    return this;
  }

  async populate(field, select) {
    const clone = JSON.parse(JSON.stringify(this));
    const popped = applyPopulate(clone, field, select || null);
    Object.assign(this, popped);
    return this;
  }

  toJSON()   { return Object.assign({}, this); }
  toObject() { return Object.assign({}, this); }
}

// ─── MockModel ────────────────────────────────────────────────────────────────

class MockModel {
  constructor(name, initialData = []) {
    this._name  = name;
    this._store = initialData.map(d => ({ ...d })); // shallow copy
  }

  // new Model(data) support
  _buildInstance(data) {
    return new MockModelInstance(data, this);
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  find(filter = {}) {
    const docs = this._store.filter(d => matches(d, filter));
    return new MockQuery(docs, false, this);
  }

  findOne(filter = {}) {
    const doc = this._store.find(d => matches(d, filter)) || null;
    return new MockQuery(doc, true, this);
  }

  findById(id) {
    const doc = this._store.find(d => String(d._id) === String(id)) || null;
    return new MockQuery(doc, true, this);
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  async create(data) {
    const arr      = Array.isArray(data) ? data : [data];
    const created  = arr.map(d => {
      const doc = { _id: generateId(), createdAt: new Date().toISOString(), ...d };
      this._store.push(doc);
      // Return a MockModelInstance so .populate() works right after create()
      return new MockModelInstance(doc, this);
    });
    return Array.isArray(data) ? created : created[0];
  }

  // Non-async : retourne un MockQuery chaînable (.populate() fonctionne)
  findOneAndUpdate(filter, update, options = {}) {
    const idx = this._store.findIndex(d => matches(d, filter));
    if (idx >= 0) {
      const patch = update.$set || update;
      // Exclure les clés Mongoose spéciales ($set déjà traité)
      const cleanPatch = {};
      Object.entries(patch).forEach(([k, v]) => {
        if (!k.startsWith('$')) cleanPatch[k] = v;
      });
      this._store[idx] = { ...this._store[idx], ...cleanPatch };
    }
    const result = idx >= 0 && options.new !== false ? this._store[idx] : null;
    return new MockQuery(result, true, this);
  }

  findByIdAndUpdate(id, update, options = {}) {
    return this.findOneAndUpdate({ _id: id }, update, options);
  }

  async findByIdAndDelete(id) {
    const idx = this._store.findIndex(d => String(d._id) === String(id));
    if (idx < 0) return null;
    const [deleted] = this._store.splice(idx, 1);
    return deleted;
  }

  async findOneAndDelete(filter) {
    const idx = this._store.findIndex(d => matches(d, filter));
    if (idx < 0) return null;
    const [deleted] = this._store.splice(idx, 1);
    return deleted;
  }

  async countDocuments(filter = {}) {
    return this._store.filter(d => matches(d, filter)).length;
  }

  // ── Aggregate (minimal) ──────────────────────────────────────────────────

  async aggregate(pipeline) {
    let docs = JSON.parse(JSON.stringify(this._store));

    for (const stage of pipeline) {
      // $match
      if (stage.$match) {
        docs = docs.filter(d => matches(d, stage.$match));
      }
      // $group (simplifié : count + first values)
      else if (stage.$group) {
        const idExpr = stage.$group._id;
        const groups = new Map();
        docs.forEach(doc => {
          // Résoudre l'expression d'ID (ex: '$pathologie' ou objet $dateToString)
          let key;
          if (typeof idExpr === 'string' && idExpr.startsWith('$')) {
            key = doc[idExpr.slice(1)] ?? '__null__';
          } else if (idExpr && typeof idExpr === 'object') {
            // $dateToString : { format, date }
            if (idExpr.$dateToString) {
              const dateField = idExpr.$dateToString.date.replace('$', '');
              const d = new Date(doc[dateField]);
              key = isNaN(d) ? '__null__' : d.toISOString().slice(0, 10);
            } else {
              key = JSON.stringify(idExpr);
            }
          } else {
            key = String(idExpr);
          }

          if (!groups.has(key)) groups.set(key, { _id: key });
          const grp = groups.get(key);

          // Accumulateurs déclarés dans $group
          Object.entries(stage.$group).forEach(([outKey, expr]) => {
            if (outKey === '_id') return;
            if (expr && expr.$sum !== undefined) {
              const v = expr.$sum === 1 ? 1 : (doc[String(expr.$sum).replace('$', '')] || 0);
              grp[outKey] = (grp[outKey] || 0) + v;
            }
            if (expr && expr.$first !== undefined) {
              const field = String(expr.$first).replace('$', '');
              if (grp[outKey] === undefined) grp[outKey] = doc[field];
            }
          });
        });
        docs = Array.from(groups.values());
      }
      // $sort
      else if (stage.$sort) {
        const entries = Object.entries(stage.$sort);
        docs.sort((a, b) => {
          for (const [k, dir] of entries) {
            const cmp = a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0;
            if (cmp !== 0) return cmp * (dir < 0 ? -1 : 1);
          }
          return 0;
        });
      }
      // $limit
      else if (stage.$limit) {
        docs = docs.slice(0, stage.$limit);
      }
      // $project
      else if (stage.$project) {
        docs = docs.map(doc => {
          const out = {};
          Object.entries(stage.$project).forEach(([k, v]) => {
            if (v === 1 || v === true) out[k] = doc[k];
            if (v === 0 || v === false) { /* exclude */ }
          });
          return out;
        });
      }
    }

    return docs;
  }

  // ── Mongoose compat ──────────────────────────────────────────────────────
  schema = { path: () => ({}) };
  modelName = '';
}

module.exports = { MockModel, setAllStores };
