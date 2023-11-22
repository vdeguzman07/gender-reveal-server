exports.createQuery = (fields, searchVal) => {
  const orQuery = [];

  for (const field of fields) {
    let query;

    // Number Fields
    if ([].includes(field)) {
      // check if searhVal is Number
      if (!Number.isNaN(+searchVal)) query = { [field]: +searchVal };
    }
    // Boolean fields
    else if ([].includes(field)) {
      if ("true".includes(searchVal)) query = { [field]: true };

      if ("false".includes(searchVal)) query = { [field]: false };
    }
    // String Fields
    else if ([].includes(field)) {
      query = {
        [field]: {
          $regex: `.*${searchVal.toString().toLowerCase().trim()}.*`,
          $options: "i",
        },
      };
      // MIXED Fields
    } else {
      const omitFields = [
        "condEnglishTranslation",
        "actionButton",
        "formattedAddress",
      ];

      if (!omitFields.includes(field)) {
        query = {
          [field]: {
            $regex: `.*${searchVal.toString().toLowerCase()}.*`,
            $options: "i",
          },
        };
        if (!Number.isNaN(+searchVal)) query = { [field]: +searchVal };
        if ("true".includes(searchVal)) query = { [field]: true };
        if ("false".includes(searchVal)) query = { [field]: false };
      }
    }

    if (query) orQuery.push(query);
  }

  return orQuery;
};
