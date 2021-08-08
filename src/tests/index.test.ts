import {
  readCSV,
  splitByEvent,
  createJSONSchema,
  JSONSchemaTypes,
  convertPath,
} from "..";

describe("readCSV", () => {
  it("gets the rows as expected", () => {
    const res = readCSV();
    expect([res[0], res[1]]).toMatchInlineSnapshot(`
Array [
  Object {
    "eventDescription": "User searched for products",
    "eventName": "Products Searched",
    "propertyDescription": "Query the user searched with",
    "propertyName": "query",
    "requiredOrOptional": "O",
    "specification": "eCommerce",
    "type": "String",
  },
  Object {
    "eventDescription": "User viewed a product list or category",
    "eventName": "Product List Viewed",
    "propertyDescription": "Product list being viewed",
    "propertyName": "list_id",
    "requiredOrOptional": "O",
    "specification": "eCommerce",
    "type": "String",
  },
]
`);
  });
});

describe("splitByEvent", () => {
  it("formats the rows as expected", () => {
    const data = readCSV();
    const res = splitByEvent(data);
    expect(res[0]).toMatchInlineSnapshot(`
Object {
  "description": "User searched for products",
  "name": "Products Searched",
  "properties": Array [
    Object {
      "description": "Query the user searched with",
      "name": "query",
      "required": false,
      "type": "string",
    },
  ],
  "specification": "ecommerce",
}
`);
  });
});

describe("convertPath", () => {
  it("gets the correct path for a simple key", () => {
    const key = "order_id";
    const res = convertPath(key);
    expect(res).toEqual({
      propertyPath: "properties.order_id",
      requiredPath: "required",
      propertyName: "order_id",
      isInArray: false,
    });
  });

  it("gets the correct path for an array", () => {
    const key = "products.$";
    const res = convertPath(key);
    expect(res).toEqual({
      propertyPath: "properties.products",
      requiredPath: "required",
      propertyName: "products",
      isInArray: false,
    });
  });

  it("gets the correct path for an array item", () => {
    const key = "products.$.id";
    const res = convertPath(key);
    expect(res).toEqual({
      propertyPath: "properties.products.items.properties.id",
      requiredPath: "properties.products.items.required",
      propertyName: "id",
      isInArray: true,
    });
  });

  it("gets the correct path for a nested object", () => {
    const key = "a.b";
    const res = convertPath(key);
    expect(res).toEqual({
      propertyPath: "properties.a.properties.b",
      requiredPath: "properties.a.required",
      propertyName: "b",
      isInArray: false,
    });
  });

  it("gets the correct path for a deeply object", () => {
    const key = "a.b.c";
    const res = convertPath(key);
    expect(res).toEqual({
      propertyPath: "properties.a.properties.b.properties.c",
      requiredPath: "properties.a.properties.b.required",
      propertyName: "c",
      isInArray: false,
    });
  });

  it("works with bracket notation", () => {
    const key = "a[b]";
    const res = convertPath(key);
    expect(res).toEqual({
      propertyPath: "properties.a.properties.b",
      requiredPath: "properties.a.required",
      propertyName: "b",
      isInArray: false,
    });
  });
});

describe("createJSONSchema", () => {
  it("creates a schema matching the snapshot", () => {
    const event = {
      name: "Product List Viewed",
      description: "User viewed a product list or category",
      specification: "ecommerce",
      properties: [
        {
          name: "list_id",
          description: "Product list being viewed",
          required: false,
          type: JSONSchemaTypes.STRING,
        },
        {
          name: "category",
          description: "Product category being viewed",
          required: false,
          type: JSONSchemaTypes.STRING,
        },
        {
          name: "products.$.product_id",
          description: "Product ID displayed in the list",
          required: true,
          type: JSONSchemaTypes.STRING,
        },
        {
          name: "products.$.category",
          description: "Product Category displayed in the list",
          required: false,
          type: JSONSchemaTypes.STRING,
        },
      ],
    };
    const res = createJSONSchema(event);
    expect(res).toMatchInlineSnapshot(`
Object {
  "$id": "https://eventfan.io/schemas/source/segment/ecommerce/product-list-viewed",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "description": "User viewed a product list or category",
  "properties": Object {
    "category": Object {
      "description": "Product category being viewed",
      "type": "string",
    },
    "list_id": Object {
      "description": "Product list being viewed",
      "type": "string",
    },
    "products": Object {
      "items": Object {
        "properties": Object {
          "category": Object {
            "description": "Product Category displayed in the list",
            "type": "string",
          },
          "product_id": Object {
            "description": "Product ID displayed in the list",
            "type": "string",
          },
        },
        "required": Array [
          "product_id",
        ],
        "type": "object",
      },
    },
  },
  "required": Array [],
  "title": "Product List Viewed",
  "type": "object",
}
`);
  });
});
