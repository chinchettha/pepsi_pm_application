<?PHP 
//require_once('vendor/autoload.php');
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
require_once('../include/define.php');
require_once('../include/function.php');


$title_page = "ข้อมูลนำเข้า Activity Type";
$tbl_policy = "tbactivitytype";
$myfile = "M_activitytype";

?>
<div id="app" class="">
	<form action="" method="post" name="frmExcelImport" id="frmExcelImport" enctype="multipart/form-data">
		<div class="modal-header">
			<h5 class="modal-title" id="exampleModalLabel">
				<!-- <span v-if="item.id == 0">สร้างใหม่</span>
				<span v-else>แก้ไข : {{ item.username }}</span> -->	
				<span >นำเข้าไฟล์ <?PHP echo $title_page;?></span>
			</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>

		<div class="modal-body">

			<fieldset>

				<!-- <form method="POST" action="<?php $PHP_SELF ?>?module=member_excelUpload" enctype="multipart/form-data" > -->
					<div class="form-group">
						<label>กรุณาเลือกไฟล์ .xls หรือ .xlsx เท่านั้น</label>
						<input type="file" id="input-b8" name="file" class="form-control" accept=".xls,.xlsx" required>
						<!-- <input id="input-b8" name="input-b8[]" multiple type="file"> -->
					</div>
						
						<div class="form-group">
							<button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times nav-icon"></i>&nbsp;ยกเลิก&nbsp;</button>
							<button type="submit" id="submit" name="import"    class="btn btn-primary btn-save"><i class="fa fa-save nav-icon"></i>Import</button>
						</div> 

					</div>
					<div id="response" class="<?php if(!empty($type)) { echo $type . " display-block"; } ?>"><?php if(!empty($message)) { echo $message; } ?></div>
    
			</fieldset>

		</div> <!-- end modal-body -->
		<div class="modal-footer">
			<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
			<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
			<input type="hidden" name="module" value="<?php echo $myfile; ?>">
			<input type="hidden" name="op" value="import">		
		</div>


	</form>
</div>