-- CreateIndex
CREATE INDEX "Address_sido_idx" ON "Address"("sido");

-- CreateIndex
CREATE INDEX "Address_estimateRequestId_idx" ON "Address"("estimateRequestId");

-- CreateIndex
CREATE INDEX "Estimate_driverId_isDelete_createdAt_idx" ON "Estimate"("driverId", "isDelete", "createdAt");

-- CreateIndex
CREATE INDEX "EstimateRequest_status_isDelete_movingType_createdAt_idx" ON "EstimateRequest"("status", "isDelete", "movingType", "createdAt");

-- CreateIndex
CREATE INDEX "EstimateRequest_status_isDelete_movingDate_idx" ON "EstimateRequest"("status", "isDelete", "movingDate");

-- CreateIndex
CREATE INDEX "EstimateRequest_createdAt_id_idx" ON "EstimateRequest"("createdAt", "id");

-- CreateIndex
CREATE INDEX "EstimateRequest_userId_isDelete_createdAt_idx" ON "EstimateRequest"("userId", "isDelete", "createdAt");

-- CreateIndex
CREATE INDEX "History_createdAt_idx" ON "History"("createdAt");

-- CreateIndex
CREATE INDEX "History_entityType_entityId_createdAt_idx" ON "History"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "History_actionType_createdAt_idx" ON "History"("actionType", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_isDelete_createdAt_idx" ON "Notification"("userId", "isRead", "isDelete", "createdAt");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");
