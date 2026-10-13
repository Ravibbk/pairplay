-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "partnerCode" TEXT NOT NULL,
    "interests" TEXT NOT NULL DEFAULT '[]',
    "loveLanguage" TEXT DEFAULT 'Quality Time',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Couple" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "anniversary" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Couple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "partnerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "category" TEXT NOT NULL DEFAULT 'Deep Connections',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PREPARING',
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 5,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameQuestion" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "GameQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAnswer" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "gameQuestionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "reaction" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySpark" (
    "id" TEXT NOT NULL,
    "coupleId" TEXT,
    "date" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySpark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_partnerCode_key" ON "User"("partnerCode");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_partnerCode_idx" ON "User"("partnerCode");

CREATE UNIQUE INDEX "Couple_user1Id_user2Id_key" ON "Couple"("user1Id", "user2Id");
CREATE INDEX "Couple_user1Id_idx" ON "Couple"("user1Id");
CREATE INDEX "Couple_user2Id_idx" ON "Couple"("user2Id");

CREATE UNIQUE INDEX "Room_code_key" ON "Room"("code");
CREATE INDEX "Room_code_idx" ON "Room"("code");
CREATE INDEX "Room_hostId_idx" ON "Room"("hostId");
CREATE INDEX "Room_partnerId_idx" ON "Room"("partnerId");

CREATE INDEX "GameSession_roomId_idx" ON "GameSession"("roomId");
CREATE INDEX "GameSession_status_idx" ON "GameSession"("status");

CREATE INDEX "Question_category_idx" ON "Question"("category");

CREATE INDEX "GameQuestion_gameSessionId_idx" ON "GameQuestion"("gameSessionId");

CREATE INDEX "GameAnswer_gameSessionId_idx" ON "GameAnswer"("gameSessionId");
CREATE INDEX "GameAnswer_userId_idx" ON "GameAnswer"("userId");
CREATE UNIQUE INDEX "GameAnswer_gameSessionId_gameQuestionId_userId_key" ON "GameAnswer"("gameSessionId", "gameQuestionId", "userId");

CREATE INDEX "DailySpark_date_idx" ON "DailySpark"("date");
CREATE INDEX "DailySpark_coupleId_idx" ON "DailySpark"("coupleId");

CREATE INDEX "ProductEvent_eventType_idx" ON "ProductEvent"("eventType");
CREATE INDEX "ProductEvent_timestamp_idx" ON "ProductEvent"("timestamp");
CREATE INDEX "ProductEvent_userId_idx" ON "ProductEvent"("userId");

-- AddForeignKey
ALTER TABLE "Couple" ADD CONSTRAINT "Couple_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Couple" ADD CONSTRAINT "Couple_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Room" ADD CONSTRAINT "Room_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameQuestion" ADD CONSTRAINT "GameQuestion_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAnswer" ADD CONSTRAINT "GameAnswer_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameAnswer" ADD CONSTRAINT "GameAnswer_gameQuestionId_fkey" FOREIGN KEY ("gameQuestionId") REFERENCES "GameQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameAnswer" ADD CONSTRAINT "GameAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySpark" ADD CONSTRAINT "DailySpark_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "Couple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductEvent" ADD CONSTRAINT "ProductEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
