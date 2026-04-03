// import AdminPromoRoute from "./admin/routes/adminPromoRoutes.js";
// import router from "./admin/routes/adminRoutes.js";

// app.use(AdminPromoRoute);
// app.use(router);

import express from "express";

import AdminPromoRoute from "./admin/routes/adminPromoRoutes.js";
import Adminrouter from "./admin/routes/adminRoutes.js";
import AdminUserRoute from "./admin/routes/adminUserRoutes.js";

const AdminRoutes = express.Router();

// group all admin routes here
AdminRoutes.use("/", Adminrouter);
AdminRoutes.use("/", AdminPromoRoute);
AdminRoutes.use("/", AdminUserRoute);

export default AdminRoutes;
