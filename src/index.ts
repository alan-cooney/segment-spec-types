/* eslint-disable no-lonely-if */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import Papa from "papaparse";
import { join } from "path";
import { paramCase } from "change-case";
import set from "set-value";
import union from "union-value";

/**
 * Read the segment CSV file
 */
export function readCSV(): SegmentCSVSpecRow[] {
  const csv = readFileSync(join(__dirname, "../segment-spec.csv"), "utf8");
  const { data } = Papa.parse(csv, {
    header: true,
    transformHeader: (h: string) => h.replace(/\s+/g, ""), // Remove whitespace
  });
  return data;
}

export enum JSONSchemaTypes {
  STRING = "string",
  FLOAT = "number",
  INTEGER = "integer",
  BOOLEAN = "boolean",
  OBJECT = "object",
  ARRAY = "array",
}

export function splitByEvent(data: SegmentCSVSpecRow[]): Event[] {
  const events: Event[] = [];

  data.forEach((row) => {
    // Add a new row if the eventName is specified
    if (row.eventName) {
      events.push({
        name: row.eventName,
        description: row.eventDescription,
        specification: row.specification.toLowerCase(),
        properties: [],
      });
    }

    // Add the event property
    events[events.length - 1].properties.push({
      name: row.propertyName,
      description: row.propertyDescription,
      required: row.requiredOrOptional === "R",
      type: row.type?.toLowerCase() as JSONSchemaTypes,
    });
  });

  return events;
}

/**
 * Get the base path in the JSON schema from the segment specific key path
 * @param key
 */
export function convertPath(key: string): {
  propertyPath: string;
  requiredPath: string;
  propertyName: string;
} {
  // Note some paths have bracket notation and some dot (e.g. a[b] rather than
  // a.b) so we need to make this uniform first (using dot notation)
  const keySplit = key.replace(/\[(.*)\]/g, `.$1`).split(".");

  const propertyPath: string[] = ["properties"];
  const requiredPath: string[] = [];
  let propertyName = "";

  keySplit.forEach((keyPart, index) => {
    // Set the property name
    if (keyPart !== "$") {
      propertyName = keyPart;
    }

    const isLastItem = index === keySplit.length - 1;
    const isInArray = keySplit?.[index - 1] === "$";
    const isInObject =
      !!keySplit?.[index - 1] &&
      keySplit?.[index - 1] !== "$" &&
      keyPart !== "$";
    const isArray = keyPart === "$";

    if (isInArray) {
      propertyPath.push("items");
      requiredPath.push("properties");
      requiredPath.push(keySplit[index - 2]);
    }

    if (isInObject) {
      propertyPath.push("properties");

      // If in a nested object
      if (index < keySplit.length) {
        requiredPath.push("properties");
        requiredPath.push(keySplit[index - 1]);
      }
    }

    if (!isArray) {
      propertyPath.push(keyPart);
    }

    if (isLastItem) {
      requiredPath.push("required");
    }
  });

  return {
    propertyPath: propertyPath.join("."),
    requiredPath: requiredPath.join("."),
    propertyName,
  };
}

export function createJSONSchema(event: Event): JSONSchema {
  const res: JSONSchema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://eventfan.io/schemas/source/segment/${paramCase(
      event.specification
    )}/${paramCase(event.name)}`,
    title: event.name,
    description: event.description,
    type: "object",
    properties: {},
    required: [],
  };

  event.properties.forEach((property) => {
    const { propertyPath, requiredPath, propertyName } = convertPath(
      property.name
    );

    set(res, propertyPath, {
      type: property.type,
      description: property.description,
    });

    if (property.required) {
      union(res, requiredPath, [propertyName]);
    }
  });

  return res;
}

export function createAllSchemas(): void {
  const data = readCSV();
  const events = splitByEvent(data);
  events.forEach((event) => {
    // Create the file path
    const fileName = `${paramCase(event.name)}.json`;
    const dir = join(__dirname, "../schemas/", paramCase(event.specification));
    const path = join(dir, fileName);

    // Create the directory
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Create the schema
    const schema = createJSONSchema(event);

    // Write the file
    writeFileSync(path, JSON.stringify(schema, undefined, 4), "utf8");
  });
}

export interface JSONSchema {
  $schema: string;
  $id: string;
  title: string;
  description: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any;
  required: string[];
}

export interface SegmentCSVSpecRow {
  specification: string;
  eventName: string;
  eventDescription: string;
  propertyName: string;
  type: string;
  propertyDescription: string;
  requiredOrOptional;
}

export interface Event {
  name: string;
  description: string;
  specification: string;
  properties: EventProperty[];
}

export interface EventProperty {
  name: string;
  description: string;
  required: boolean;
  type: JSONSchemaTypes;
}
