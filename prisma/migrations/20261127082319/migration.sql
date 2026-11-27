-- AlterTable
ALTER TABLE `tbl_facility` MODIFY `create_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD PRIMARY KEY (`kode_facility`);
