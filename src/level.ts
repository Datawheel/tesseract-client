import urljoin from "url-join";
import {joinFullname} from "./common";
import Cube from "./cube";
import Dimension from "./dimension";
import Hierarchy from "./hierarchy";
import {Annotations, Drillable, Property, Serializable} from "./interfaces";
import {Annotated, applyMixins} from "./mixins";

const INTRINSIC_PROPERTIES = ["Caption", "Key", "Name", "UniqueName"];

class Level implements Drillable, Serializable {
  readonly annotations: Annotations = {};
  readonly caption?: string;
  readonly depth: number;
  hierarchy: Hierarchy;
  readonly isDrillable: boolean = true;
  readonly isLevel: boolean = true;
  readonly name: string;
  readonly properties: Property[] = [];

  constructor(
    name: string,
    annotations: Annotations,
    properties: Property[],
    depth: number,
    caption: string
  ) {
    this.annotations = annotations;
    this.caption = caption || name;
    this.depth = depth;
    this.name = name;
    this.properties = properties;
  }

  static fromJSON(json: any): Level {
    return new Level(
      json["name"],
      json["annotations"],
      json["properties"],
      json["depth"],
      json["caption"]
    );
  }

  static isLevel(obj: any): obj is Level {
    return Boolean(obj && obj.isLevel);
  }

  get cube(): Cube {
    return this.hierarchy.dimension.cube;
  }

  get dimension(): Dimension {
    return this.hierarchy.dimension;
  }

  get fullname(): string {
    return joinFullname(this.fullnameParts);
  }

  get fullnameParts(): string[] {
    const nameParts = [this.dimension.name];
    if (this.dimension.name !== this.hierarchy.name) {
      nameParts.push(this.hierarchy.name);
    }
    nameParts.push(this.name);
    return nameParts;
  }

  hasProperty(propertyName: string): boolean {
    return (
      INTRINSIC_PROPERTIES.indexOf(propertyName) > -1 ||
      this.properties.some(prop => prop.name === propertyName)
    );
  }

  toJSON(): any {
    return {
      annotations: this.annotations,
      caption: this.caption,
      depth: this.depth,
      fullname: this.fullname,
      name: this.name,
      properties: this.properties,
      uri: this.toString()
    };
  }

  toString(): string {
    return urljoin(this.hierarchy.toString(), "levels", encodeURIComponent(this.name));
  }
}

interface Level extends Annotated {}

applyMixins(Level, [Annotated]);

export default Level;
