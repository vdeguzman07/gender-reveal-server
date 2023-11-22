const _ = require("lodash");
const mongoose = require("mongoose");
const { createQuery } = require("./search");

const parseMongoOperator = (obj, type) => {
  const stringifyObj = JSON.stringify(obj);
  const replacedOperator = stringifyObj.replace(
    /\b(gte|gt|lte|lt|ne|eq|in|nin)\b/g,
    (match) => `$${match}`
  );
  const parsedOperator = JSON.parse(replacedOperator);

  for (let key of Object.keys(parsedOperator)) {
    if (type && type === "number") parsedOperator[key] = +parsedOperator[key];
    if (parsedOperator[key] === "null") parsedOperator[key] = null;
    if (parsedOperator[key] === "true") parsedOperator[key] = true;
    if (parsedOperator[key] === "false") parsedOperator[key] = false;
  }

  return parsedOperator;
};

class QueryFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let orQuery = [];
    const mappedKeyObjKey = [];
    let queryObj = JSON.parse(JSON.stringify(this.queryString));
    const mongoOperator = ["gte", "gt", "lte", "lt", "ne", "eq", "in", "nin"];
    const removeField = [
      "page",
      "sort",
      "limit",
      "fields",
      "populate",
      "popField",
    ];

    queryObj = _.omit(queryObj, removeField);

    // manipulate "in" and "nin" operator value to array if available
    for (let key of Object.keys(queryObj)) {
      const keyList = key.split(".");
      // HANDLES OR QUERY
      if (keyList[0].toLocaleLowerCase() === "or") {
        const searchType = keyList[1];
        let _key = keyList.join(".").substring(3 + searchType.length + 1);
        const value = parseMongoOperator(queryObj[key], searchType);

        if (searchType === "number") {
          orQuery.push({ [`${_key}`]: value });
        } else if (searchType === "string") {
          orQuery.push({
            [`${_key}`]: {
              $regex: `.*${value.toString()}.*`,
              $options: "i",
            },
          });
        } else if (searchType === "boolean") {
          if ("true".includes(value)) orQuery.push({ [field]: true });
          if ("false".includes(value)) orQuery.push({ [field]: false });
        } else orQuery.push({ [`${_key}`]: value });

        delete queryObj[key];
      }

      if (queryObj[key] === "true") queryObj[key] = true;
      if (queryObj[key] === "false") queryObj[key] = false;

      if (typeof queryObj[key] === "object") {
        for (let objKey of Object.keys(queryObj[key])) {
          if (queryObj[key][objKey] === "null") queryObj[key][objKey] = null;
          if (queryObj[key][objKey] === "true") queryObj[key][objKey] = true;
          if (queryObj[key][objKey] === "false") queryObj[key][objKey] = false;
          if (
            (objKey === "in" || objKey === "nin") &&
            typeof queryObj[key][objKey] === "string"
          ) {
            queryObj[key][objKey] = queryObj[key][objKey].split(",");
            mappedKeyObjKey.push(key);
          } else if (!mongoOperator.includes(objKey)) {
            if (
              typeof queryObj[key][objKey] === "object" &&
              !Array.isArray(queryObj[key][objKey])
            ) {
              if (queryObj[key][objKey] !== null) {
                for (let _key of Object.keys(queryObj[key][objKey])) {
                  if (queryObj[key][objKey][_key] === "null")
                    queryObj[key][objKey][_key] = null;
                  if (queryObj[key][objKey][_key] === "true")
                    queryObj[key][objKey][_key] = true;
                  if (queryObj[key][objKey][_key] === "false")
                    queryObj[key][objKey][_key] = false;
                }
              }
            }
            queryObj[`${key}.${objKey}`] = queryObj[key][objKey];
            delete queryObj[key][objKey];
          }
        }
      }

      if (
        typeof queryObj[key] === "object" &&
        !Object.keys(queryObj[key]).length
      )
        delete queryObj[key];
    }

    if (queryObj.searchVal && queryObj.searchFields) {
      const fields = queryObj.searchFields.split(",");
      orQuery = createQuery(fields, queryObj.searchVal);

      delete queryObj.searchVal;
      delete queryObj.searchFields;
    }

    // normal query
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace("null", null);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|ne|eq|in|nin)\b/g,
      (match) => `$${match}`
    );

    const qObj = JSON.parse(queryStr);

    // PARSE THE _id VALUE OF $in & nin operator to ObjectId
    for (let keyValue of mappedKeyObjKey) {
      if (qObj[keyValue]) {
        for (let key of Object.keys(qObj[keyValue])) {
          if (qObj[keyValue][key] && Array.isArray(qObj[keyValue][key])) {
            qObj[keyValue][key] = qObj[keyValue][key].map((value) => {
              const mongovalue =
                value.length === 12 || value.length === 24 ? value : null;

              const isValidMongoId =
                value.toString() ===
                mongoose.Types.ObjectId(mongovalue).toString();

              if (isValidMongoId && mongoose.isValidObjectId(value)) {
                return mongoose.Types.ObjectId(value);
              } else return value;
            });
          }
        }
      }
    }

    if (orQuery.length) this.query.find({ ...qObj, $or: orQuery });
    else this.query.find({ ...qObj });
    // console.log(qObj);
    return this;
  }

  count() {
    this.query = this.query.countDocuments();
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 9999999;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  populate() {
    const populateDB = this.queryString.populate;
    const field = this.queryString.popField;

    if (populateDB) {
      if (Array.isArray(populateDB)) {
        for (let [index, populate] of populateDB.entries()) {
          const select = Array.isArray(field)
            ? // if field is array
              field[index]
              ? // if field[index] is not undefined
                field[index].split(",").join(" ")
              : // use field[0] if field[index] is undefined
                field[0].split(",").join(" ")
            : // if field is not array
              field && field.split(",").join(" ");

          this.query = this.query.populate({
            path: populate,
            select,
          });
        }
      } else {
        if (Array.isArray(field)) {
          const select = [];

          for (let key of field) {
            const currentKey = key.split(",");

            for (let str of currentKey)
              if (!select.includes(str)) select.push(str);
          }

          this.query = this.query.populate({
            path: populateDB,
            select: select.join(" "),
          });
        } else {
          this.query = this.query.populate({
            path: populateDB,
            select: field && field.split(",").join(" "),
          });
        }
      }
    }

    return this;
  }
}

module.exports = QueryFeatures;
