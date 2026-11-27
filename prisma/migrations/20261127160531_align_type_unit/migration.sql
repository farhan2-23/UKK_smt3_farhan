-- Add primary key and auto increment to tbl_type_unit
ALTER TABLE `tbl_type_unit`
    MODIFY `id_unit_type` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `nama_type_unit` VARCHAR(100) NOT NULL,
    MODIFY `branch_id` INTEGER NOT NULL,
    MODIFY `create_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `update_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
    ADD PRIMARY KEY (`id_unit_type`);

-- Make the junction table identifiable and enforce referential integrity
ALTER TABLE `tbl_type_unit_facility`
    ADD PRIMARY KEY (`id_unit_type`, `kode_facility`),
    ADD CONSTRAINT `tbl_type_unit_facility_id_unit_type_fkey`
        FOREIGN KEY (`id_unit_type`) REFERENCES `tbl_type_unit`(`id_unit_type`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `tbl_type_unit_facility_kode_facility_fkey`
        FOREIGN KEY (`kode_facility`) REFERENCES `tbl_facility`(`kode_facility`)
        ON DELETE CASCADE ON UPDATE CASCADE;
