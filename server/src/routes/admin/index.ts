import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { restaurantRouter } from "./restaurant";
import { categoriesRouter } from "./categories";
import { productsRouter } from "./products";
import { uploadsRouter } from "./uploads";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use("/restaurant", restaurantRouter);
adminRouter.use("/categories", categoriesRouter);
adminRouter.use("/products", productsRouter);
adminRouter.use("/uploads", uploadsRouter);
