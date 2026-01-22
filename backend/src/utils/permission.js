function canView(permission) {
  return ["VIEW_ONLY", "VIEW_EDIT", "FULL_ACCESS"].includes(permission);
}

function canCreate(permission) {
  return permission === "FULL_ACCESS";
}

function canEdit(permission) {
  return ["VIEW_EDIT", "FULL_ACCESS"].includes(permission);
}

function canDelete(permission) {
  return permission === "FULL_ACCESS";
}


export {
  canCreate,
  canView,
  canDelete,
  canEdit
}