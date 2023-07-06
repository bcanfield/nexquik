#! /usr/bin/env node
import { DMMF } from "@prisma/generator-helper";

export interface ModelTree {
  modelName: string;
  parent?: DMMF.Model;
  model: DMMF.Model;
  children: ModelTree[];
  uniqueIdentifierField?: DMMF.Field;
}

export function getCompositeKeyFields(
  model: ModelTree
): { fieldName: string; fieldType: string }[] | null {
  const compositeKeyFields: { fieldName: string; fieldType: string }[] = [];

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
    const uniqueIdField = model.fields.find((field) => field.isId === true);
    return {
      modelName: model.name,
      model: model,
      parent: parent,
      uniqueIdentifierField: uniqueIdField,
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
