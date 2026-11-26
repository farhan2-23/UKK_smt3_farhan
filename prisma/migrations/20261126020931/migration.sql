-- CreateTable
CREATE TABLE `tbl_facility` (
    `kode_facility` VARCHAR(20) NOT NULL,
    `nama_facility` VARCHAR(20) NOT NULL,
    `create_at` DATETIME(0) NOT NULL,
    `update_at` DATETIME(0) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_type_unit` (
    `id_unit_type` INTEGER NOT NULL,
    `nama_type_unit` VARCHAR(100) NOT NULL,
    `branch_id` INTEGER NOT NULL,
    `create_at` DATETIME(0) NOT NULL,
    `update_at` DATETIME(0) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_type_unit_facility` (
    `id_unit_type` INTEGER NOT NULL,
    `kode_facility` VARCHAR(20) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
