-- CreateEnum
CREATE TYPE "CourseLectureType" AS ENUM ('VIDEO', 'TEXT');

-- CreateEnum
CREATE TYPE "CourseAccessDuration" AS ENUM ('LIFETIME', 'ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR');

-- CreateEnum
CREATE TYPE "AssessmentQuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTI_CHOICE', 'TRUE_FALSE');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'DELETED');

-- CreateTable
CREATE TABLE "NewCourse" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "creatorId" TEXT NOT NULL,
    "creatorRole" "Role" NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "hasPreview" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER NOT NULL DEFAULT 0,
    "accessDuration" "CourseAccessDuration" NOT NULL DEFAULT 'LIFETIME',
    "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
    "certificateValidityDays" INTEGER,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSection" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLecture" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CourseLectureType" NOT NULL DEFAULT 'VIDEO',
    "contentUrl" TEXT,
    "durationSeconds" INTEGER,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseAssessment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentQuestion" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "AssessmentQuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE',
    "options" TEXT[],
    "correctAnswer" TEXT[],
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseCartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseWishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseWishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseWishlistItem" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseWishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessExpiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureProgress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LectureProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAttempt" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "attemptNumber" INTEGER NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseCertificate" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "certificateUrl" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "CourseCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewCourse_slug_key" ON "NewCourse"("slug");

-- CreateIndex
CREATE INDEX "NewCourse_creatorId_idx" ON "NewCourse"("creatorId");

-- CreateIndex
CREATE INDEX "NewCourse_slug_idx" ON "NewCourse"("slug");

-- CreateIndex
CREATE INDEX "NewCourse_status_isDeleted_idx" ON "NewCourse"("status", "isDeleted");

-- CreateIndex
CREATE INDEX "CourseSection_courseId_idx" ON "CourseSection"("courseId");

-- CreateIndex
CREATE INDEX "CourseLecture_sectionId_idx" ON "CourseLecture"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseAssessment_courseId_key" ON "CourseAssessment"("courseId");

-- CreateIndex
CREATE INDEX "AssessmentQuestion_assessmentId_idx" ON "AssessmentQuestion"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCart_userId_key" ON "CourseCart"("userId");

-- CreateIndex
CREATE INDEX "CourseCartItem_cartId_idx" ON "CourseCartItem"("cartId");

-- CreateIndex
CREATE INDEX "CourseCartItem_courseId_idx" ON "CourseCartItem"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCartItem_cartId_courseId_key" ON "CourseCartItem"("cartId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseWishlist_userId_key" ON "CourseWishlist"("userId");

-- CreateIndex
CREATE INDEX "CourseWishlistItem_wishlistId_idx" ON "CourseWishlistItem"("wishlistId");

-- CreateIndex
CREATE INDEX "CourseWishlistItem_courseId_idx" ON "CourseWishlistItem"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseWishlistItem_wishlistId_courseId_key" ON "CourseWishlistItem"("wishlistId", "courseId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_courseId_idx" ON "CourseEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_userId_idx" ON "CourseEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_courseId_userId_key" ON "CourseEnrollment"("courseId", "userId");

-- CreateIndex
CREATE INDEX "LectureProgress_enrollmentId_idx" ON "LectureProgress"("enrollmentId");

-- CreateIndex
CREATE INDEX "LectureProgress_lectureId_idx" ON "LectureProgress"("lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "LectureProgress_enrollmentId_lectureId_key" ON "LectureProgress"("enrollmentId", "lectureId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_enrollmentId_idx" ON "AssessmentAttempt"("enrollmentId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_assessmentId_idx" ON "AssessmentAttempt"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCertificate_enrollmentId_key" ON "CourseCertificate"("enrollmentId");

-- CreateIndex
CREATE INDEX "CourseCertificate_userId_idx" ON "CourseCertificate"("userId");

-- CreateIndex
CREATE INDEX "CourseCertificate_courseId_idx" ON "CourseCertificate"("courseId");

-- AddForeignKey
ALTER TABLE "NewCourse" ADD CONSTRAINT "NewCourse_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSection" ADD CONSTRAINT "CourseSection_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "NewCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLecture" ADD CONSTRAINT "CourseLecture_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CourseSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAssessment" ADD CONSTRAINT "CourseAssessment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "NewCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "CourseAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCart" ADD CONSTRAINT "CourseCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCartItem" ADD CONSTRAINT "CourseCartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "CourseCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCartItem" ADD CONSTRAINT "CourseCartItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "NewCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseWishlist" ADD CONSTRAINT "CourseWishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseWishlistItem" ADD CONSTRAINT "CourseWishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "CourseWishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseWishlistItem" ADD CONSTRAINT "CourseWishlistItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "NewCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "NewCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureProgress" ADD CONSTRAINT "LectureProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureProgress" ADD CONSTRAINT "LectureProgress_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "CourseLecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "CourseAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "NewCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
