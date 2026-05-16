<?php
//include('../include/connection.php');
$strSQL = " SELECT * FROM tbl_member where id ='".$_SESSION['mem_id']."';";
$query = mysqli_query($link, $strSQL);
$objResult = mysqli_fetch_array($query);
//echo $strSQL;
?>

<!-- Main content -->
<div class="content">
	<!-- Content Header (Page header) -->
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0 text-dark">ข้อมูลส่วนตัว</h1>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="index.php">หน้าหลัก</a></li>
              <li class="breadcrumb-item active">ข้อมูลส่วนตัว</li>
            </ol>
          </div><!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->

<!-- <form action="" method="post" name="frmMain"> -->
<form role="form" name="frmMain" method="post" action="<?php echo $_SERVER["PHP_SELF"];?>?module=member_change_password_process">

	<!-- <table width='100%' border=0 class='myTable' align='center'> -->
	<table class="table table-bordered" width='100%'>
		<tbody>
			<tr>
				<th colspan="5" class="active">ข้อมูลส่วนตัว
					<!-- <a href="pages/member_chk_password.php" role="button" class="btn btn-warning btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-key nav-icon"></i>&nbsp;เปลี่ยนรหัสผ่าน</a> -->
				</th>
			</tr>

			<tr>
				<th  align='right'class="active" width='250'><label>หมายเลขบัตรประจำตัวประชาชน : </label></th>
				<td  bgcolor='#FFFFFF'>
				<input class="form-control text-box single-line" type="text" name="idcard" id="idcard" value="<?=$objResult['idcard'];?>" readonly/>
				</td>
			</tr>
			<tr>
				<th align='right'class="active"> <label>ชื่อ - นามสกุล  : </label></th>
				<td bgcolor='#FFFFFF'>
				<input class="form-control text-box single-line" type="text" name="fullname" id="fullname" value="<?=$objResult['fullname'];?>" readonly/>
				</td>
			</tr>
			<tr>
				<th align='right'class="active"> <label>ชื่อผู้ใช้งานระบบ : </label></th>
				<td bgcolor='#FFFFFF'>
				<input class="form-control text-box single-line" type="text" name="username" id="username" value="<?=$objResult['username'];?>" readonly />
				</td>
			</tr>
			<tr>
				<th align='right'class="active"> <label>รหัสผ่านเดิม : </label></th>
				<td bgcolor='#FFFFFF'>
				<input class="form-control text-box single-line" type="password" name="password-old" id="password-old" value="<?=$objResult['password-old'];?>" required/>
				</td>
			</tr>
			<tr>
				<th align='right'class="active"> <label>รหัสผ่านใหม่ : </label></th>
				<td bgcolor='#FFFFFF'>
				<input class="form-control text-box single-line" type="password" name="password-new" id="password-new" value="<?=$objResult['password-new'];?>" required/>
				</td>
			</tr>
			<tr>
				<th align='right'class="active"> <label>ยืนยันรหัสผ่านใหม่ : </label></th>
				<td bgcolor='#FFFFFF'>
				<input class="form-control text-box single-line" type="password" name="confpassword" id="confpassword" value="<?=$objResult['confpassword'];?>" required/>
				</td>
			</tr>

			<tr>
				<th  align='right' class="active"><label></label></th>
				<td  bgcolor='#FFFFFF'>
	<input type="hidden" name="act" value="update">

					<button type="submit" id="btn" name="btn" class="btn btn-danger" tabindex="">
					<i class="fa fa-key nav-icon"></i>&nbsp;แก้ไขรหัสผ่าน</button>

	<input name="btnAdd" type="button" class="btn btn-info btnAdd" value="บันทึกเพิ่ม" onClick="frmMain.hdnCmd.value='Add';frmMain.submit();">

	<!-- <input name="btnAdd" type="button" class="btn btn-info btnAdd" value="บันทึกเพิ่ม" onClick="frmMain.hdnCmd.value='Add';frmMain.submit();"> -->
	<input name="btnAdd" type="button" id="btnUpdate" value="แก้ไขรหัสผ่าน" onClick="frmMain.hdnCmd.value='Update';frmMain.submit();" class="btn btn-primary btn-xs">
	<input name="btnAdd" type="button" id="btnCancel" value="ย้อนกลับ" onClick="window.location='<?php echo $_SERVER["PHP_SELF"];?>?module=<?=$myfile?>';" class="btn btn-warning btn-xs">

				</td>
			</tr>

			<!-- <tr>
				<td colspan="5" align='center'>
					<button type="submit" id="btn" name="btn" class="btn btn-primary" tabindex="">
					<span class="glyphicon glyphicon-floppy-saved"></span> พิมพ์สลิป</button>
					<a href="dashboard.php"><button type="button" class="btn btn-warning" tabindex="">
					<span class="glyphicon glyphicon-floppy-remove"></span> ยกเลิก</button></a>
				</td>
			</tr> -->
	</table>

	<!-- <div class="send" align="center">
	<button type="submit" class="red-button" id="senddata" name="btnSubmit"> ส่งข้อมูล </button>&nbsp;
	</div> -->

	<div id="output"></div>
</form>

</div>
<!-- End Main content -->

<!-- normal Modal -->
<div class="modal fade custom-modal" id="ajaxModal" tabindex="-1" role="dialog" aria-labelledby="ajaxModalLabel" aria-hidden="true" data-backdrop="static">
	<div class="modal-dialog" role="document">
		<div class="modal-content">

		</div>
	</div>
</div>
<!-- END normal Modal -->

<!-- large Modal -->
<div class="modal fade custom-modal" id="ajaxLargeModal" tabindex="-1" role="dialog" aria-labelledby="ajaxModalLabel" aria-hidden="true" data-backdrop="static">
	<div class="modal-dialog modal-lg" role="document">
		<div class="modal-content">

		</div>
	</div>
</div>
<!-- END large Modal -->

&nbsp;