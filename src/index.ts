import { readFileSync } from "fs";
import Papa from "papaparse";
import { join } from "path";

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

enum PropertyType {
  STRING = "STRING",
  FLOAT = "FLOAT",
  INTEGER = "INTEGER",
  ARRAY = "ARRAY",
}

/**
 * Type mapping from the CSV format to our enum
 */
export const typeMapping: { [key: string]: PropertyType } = {
  String: PropertyType.STRING,
  Number: PropertyType.FLOAT,
  Integer: PropertyType.INTEGER,
  Array: PropertyType.ARRAY,
};

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
      type: typeMapping[row.type],
    });
  });

  return events;
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
  type: PropertyType;
}
