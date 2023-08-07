#! /usr/bin/env node
import { DMMF } from "@prisma/generator-helper";
import chalk from "chalk";

export interface ModelTree {
  modelName: string;
  parent?: DMMF.Model;
  model: DMMF.Model;
  children: ModelTree[];
  uniqueIdentifierField: { name: string; type: string }[];
}

export function getCompositeIdField(model: DMMF.Model): DMMF.PrimaryKey | null {
  return model.primaryKey;
}

export function getCompositeKeyFields(
  model: ModelTree
): { fieldName: string; fieldType: string }[] | null {
  console.log("BRANDIN get composite key field");
  const compositeKeyFields: { fieldName: string; fieldType: string }[] = [];
  console.log("BRANDIN MODEL", model.model);

  for (const field of model.model.fields) {
    if (field.kind === "object" && !field.isList && field.relationFromFields) {
      const relatedModel = model.children.find(
        (child) => child.model.name === field.type
      );
      if (relatedModel) {
        const relatedField = relatedModel.model.fields.find(
          (f) =>
            field.relationFromFields && f.name === field.relationFromFields[0]
        );

        if (relatedField) {
          compositeKeyFields.push({
            fieldName: field.relationFromFields[0],
            fieldType: relatedField.type,
          });
        }
      }
    }
  }

  if (compositeKeyFields.length >= 2) {
    return compositeKeyFields;
  }

  return null;
}

export function createModelTree(dataModel: DMMF.Datamodel): ModelTree[] {
  const models = dataModel.models;

  // Create a map of models for efficient lookup
  const modelMap: Record<string, DMMF.Model> = {};
  for (const model of models) {
    modelMap[model.name] = model;
  }

  const visitedModels: Set<string> = new Set();
  const modelTrees: ModelTree[] = [];

  // Function to recursively build the model tree
  function buildModelTree(
    model: DMMF.Model,
    parent?: DMMF.Model
  ): ModelTree | undefined {
    // If we detect a circular relationship, just stop digging down into child nodes
    if (visitedModels.has(model.name)) {
      // throw new Error(`Circular relationship detected in model: ${model.name}`);
      console.log(`Circular relationship detected in model: ${model.name}`);
      return;
    }

    visitedModels.add(model.name);

    const childRelationships = model.fields.filter(
      (field) => field.kind === "object" && field.isList
    );

    const children: ModelTree[] = [];
    for (const relationship of childRelationships) {
      const childModel = modelMap[relationship.type];
      if (childModel) {
        const childNode = buildModelTree(childModel, model);
        if (childNode) {
          children.push(childNode);
        }
      }
    }

    visitedModels.delete(model.name);
    const fullUniqueIdField = model.fields.find((field) => field.isId === true);
    let uniqueIdFieldReturn: { name: string; type: string }[] = [];
    if (!fullUniqueIdField) {
      // Check for composite id field
      const compositePrimaryKey = getCompositeIdField(model);
      if (compositePrimaryKey) {
        console.log(
          chalk.yellow(
            `Nexquik does not yet support composite field types. Model: ${model.name}`
          )
        );
        // For each field in fields, find the actual field
        const actualFields = model.fields
          .filter((modelField) =>
            compositePrimaryKey.fields.includes(modelField.name)
          )
          .map((f) => ({ name: f.name, type: f.type }));
        console.log({ actualFields });
        uniqueIdFieldReturn = actualFields;
      } else {
        console.log(
          chalk.yellow(
            `Nexquik could not fund a unique ID field for Model: ${model.name}`
          )
        );
        return;
      }
    } else {
      uniqueIdFieldReturn.push({
        name: fullUniqueIdField.name,
        type: fullUniqueIdField.type,
      });
    }
    return {
      modelName: model.name,
      model: model,
      parent: parent,
      uniqueIdentifierField: uniqueIdFieldReturn,
      children,
    };
  }

  for (const model of models) {
    if (
      !model.fields.some(
        (field) => field.kind === "object" && field.isRequired && !field.isList
      )
    ) {
      const modelTree = buildModelTree(model);
      if (modelTree) {
        modelTrees.push(modelTree);
      }
    }
  }

  return modelTrees;
}

export function getParentReferenceField(
  modelTree: ModelTree
): string | undefined {
  if (!modelTree.parent) {
    return undefined;
  }

  const parentModel = modelTree.model;
  const parentField = parentModel.fields.find(
    (field) => field.type === modelTree.parent?.name
  );

  if (!parentField) {
    return undefined;
  }

  // Find the unique ID field in the current model that matches the parent reference field
  const uniqueIdField = modelTree.model.fields.find(
    (field) => field.name === parentField.name
  );

  return uniqueIdField?.name;
}
