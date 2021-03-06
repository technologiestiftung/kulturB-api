const csv = require("csvtojson");

const assignType = (type) => {
  if (type === "VENUE") return ["venue"];
  if (type === "ORG") return ["organisation"];
  return ["organisation", "venue"];
};

const assignTags = (tag, tags) => {
  const result = [];

  tags.forEach((entry) => {
    const { name } = entry;
    if (tag.toLowerCase().includes(name.toLowerCase())) {
      result.push(entry);
    }
  });

  return result;
};

const register = async (server, options) => {
  const csvFile = options.csvFile || "./data/daten.csv";

  const data = await csv().fromFile(csvFile);
  const tags = await server.plugins.tags.service.find(undefined, {});
  const mappedData = data.map((entry) => {
    const assignedTags = assignTags(entry.Sparte, tags.data);

    return {
      name: entry.Institution,
      address: entry.Adresse,
      zipcode: entry.PLZ,
      city: entry.Ort,
      website:
        entry.Webseite !== undefined &&
        entry.Webseite.startsWith("http") === true
          ? entry.Webseite
          : `https://${entry.Webseite}`,
      types: assignType(entry.Typ),
      tags: assignedTags,
    };
  });

  mappedData.forEach(async (entry) => {
    try {
      await server.plugins.organisations.service.create(entry);
    } catch (err) {
      if (err.name !== "ValidationError") {
        console.log(err);
      }
    }
  });
};

exports.plugin = {
  name: "tsb-importer",
  version: "0.0.1",
  register,
};
