#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParentReferenceField = exports.createModelTree = void 0;
function createModelTree(dataModel) {
    const models = dataModel.models;
    // Create a map of models for efficient lookup
    const modelMap = {};
    for (const model of models) {
        modelMap[model.name] = model;
    }
    const visitedModels = new Set();
    const modelTrees = [];
    // Function to recursively build the model tree
    function buildModelTree(model, parent) {
        if (visitedModels.has(model.name)) {
            throw new Error(`Circular relationship detected in model: ${model.name}`);
        }
        visitedModels.add(model.name);
        const childRelationships = model.fields.filter((field) => field.kind === "object" && field.isList);
        const children = [];
        for (const relationship of childRelationships) {
            const childModel = modelMap[relationship.type];
            if (childModel) {
                const childNode = buildModelTree(childModel, model);
                children.push(childNode);
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
        if (!model.fields.some((field) => field.kind === "object" && field.isRequired && !field.isList)) {
            const modelTree = buildModelTree(model);
            modelTrees.push(modelTree);
        }
    }
    return modelTrees;
}
exports.createModelTree = createModelTree;
function getParentReferenceField(modelTree) {
    if (!modelTree.parent) {
        return undefined;
    }
    const parentModel = modelTree.model;
    const parentField = parentModel.fields.find((field) => { var _a; return field.type === ((_a = modelTree.parent) === null || _a === void 0 ? void 0 : _a.name); });
    if (!parentField) {
        return undefined;
    }
    // Find the unique ID field in the current model that matches the parent reference field
    const uniqueIdField = modelTree.model.fields.find((field) => field.name === parentField.name);
    return uniqueIdField === null || uniqueIdField === void 0 ? void 0 : uniqueIdField.name;
}
exports.getParentReferenceField = getParentReferenceField;
//# sourceMappingURL=modelTree.js.map