
<div id="app" class="">
	<form action="<?php $PHP_SELF ?>?module=tb_equipment_imports_process" role="form" id="modalForm" method="post" enctype="multipart/form-data" name="Submit">
	<!-- <form action="pages/tb_equipment_import_process.php" role="form" id="modalForm" method="post" enctype="multipart/form-data" name="Submit"> -->

		<div class="modal-header">
			<h5 class="modal-title" id="exampleModalLabel">
				<!-- <span v-if="item.id == 0">สร้างใหม่</span>
				<span v-else>แก้ไข : {{ item.username }}</span> -->	
				<span >นำเข้าไฟล์ข้อมูล</span>
			</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>

		<div class="modal-body">

			<fieldset>

				<!-- <form method="POST" action="<?php $PHP_SELF ?>?module=member_excelUpload" enctype="multipart/form-data" > -->
					<div class="form-group">
						<label>กรุณาเลือกไฟล์ .csv หรือ .xls เท่านั้น</label>
						<input type="file" id="input-b8" name="file" class="form-control" accept=".csv,.xls,.xlsx" required>
						<!-- <input id="input-b8" name="input-b8[]" multiple type="file"> -->
					</div>
						<script>
						$(document).ready(function() {
							$("#input-b8").fileinput({
								rtl: true,
								dropZoneEnabled: false,
								allowedFileExtensions: ["csv","xls","xlsx"]
							});
						});
						</script>

						<!-- <div class="form-group">
							<button type="submit" name="Submit" class="btn btn-success float-right"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกนำเข้าข้อมูล</button>
						</div> -->

					</div>

			</fieldset>

		</div> <!-- end modal-body -->
		<div class="modal-footer">
			<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
			<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
			<input type="hidden" name="module" value="<?php echo $myfile; ?>">
			<input type="hidden" name="op" value="save">
			<!-- <button type="submit" class="btn btn-success" name="submit"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกข้อมูล&nbsp;</button> -->
			<button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times nav-icon"></i>&nbsp;ยกเลิก&nbsp;</button>
			<button type="submit" name="Submit" v-on:click.prevent="submitData()" class="btn btn-primary btn-save"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกนำเข้าข้อมูล&nbsp;</button>
		</div>


	</form>
</div>