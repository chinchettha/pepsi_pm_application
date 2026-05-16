<!-- Content Header (Page header) -->
<section class="content-header">
  <div class="container-fluid">
	<div class="row mb-2">
	  <div class="col-sm-6">
		<h1>สมาชิก</h1>
	  </div>
	  <div class="col-sm-6">
		<ol class="breadcrumb float-sm-right">
		  <li class="breadcrumb-item"><a href="#">หน้าหลัก</a></li>
		  <li class="breadcrumb-item active">นำเข้าไฟล์ข้อมูลสมาชิก</li>
		</ol>
	  </div>
	</div>
  </div><!-- /.container-fluid -->
</section>

<!-- Main content -->
<section class="content">
  <div class="row">
	<div class="col-12">
	  <div class="card">
		<div class="card-header">
		  <h3 class="card-title">รายการนำเข้าไฟล์ข้อมูลสมาชิกใหม่</h3>
			<div class="float-right">
				<a href="pages/member_import.php" role="button" class="btn btn-success btn-success float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-download nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูลสมาชิก</a>
				<a href="<?php $PHP_SELF ?>?module=member" role="button" class="btn btn-info btn-success float-right"><i class="fa fa-chevron-circle-left nav-icon"></i>&nbsp;ย้อนกลับไปหน้าสมาชิกทั้งหมด</a>
			</div>

		</div>

		<!-- /.card-header -->
		<div class="card-body">
		<div class="table-responsive">


<?php
require('excel-upload/library/php-excel-reader/excel_reader2.php');
require('excel-upload/library/SpreadsheetReader.php');
require('excel-upload/db_config.php');
	
if(isset($_POST['Submit'])){

	$mimes = ['application/vnd.ms-excel','text/xls','text/xlsx','application/vnd.oasis.opendocument.spreadsheet'];
	if(in_array($_FILES["file"]["type"],$mimes)){

		ini_set('display_errors', 1);
		ini_set('display_startup_errors', 1);
		error_reporting(E_ALL);
		
		$uploadFilePath = 'member_uploads/'.basename($_FILES['file']['name']);
		move_uploaded_file($_FILES['file']['tmp_name'], $uploadFilePath);

		$Reader = new SpreadsheetReader($uploadFilePath);

		$totalSheet = count($Reader->sheets());

		echo "You have total ".$totalSheet." sheets".

		$html="<table border='1' id='example1' class='table table-bordered table-striped' data-page-length='100'>";
		$html.="
		<thead><tr>
		<th>ลำดับ</th>
		<th>เลขบัตรประจำตัวประชาชน</th>
		<th>ชื่อ-นามสกุล</th>
		<th>ชื่อผู้ใช้งาน</th>
		<th>เลขบัญชีธนาคาร</th>
		</tr></thead>
		<tbody>";

		/* For Loop for all sheets */
		for($i=0;$i<$totalSheet;$i++){

			$Reader->ChangeSheet($i);
			foreach ($Reader as $Row)
	        {
	        	$html.="<tr>";
				/* Check If sheet not emprt */
		        $no = isset($Row[0]) ? $Row[0] : '';
		        $idcard = isset($Row[1]) ? $Row[1] : '';
				$fullname = isset($Row[2]) ? $Row[2] : '';
				$username = isset($Row[3]) ? $Row[3] : '';
				$password = isset($Row[4]) ? $Row[4] : '';
				$bank_no = isset($Row[5]) ? $Row[5] : '';
				$html.="<td>".$no."</td>";
				$html.="<td>".$idcard."</td>";
				$html.="<td>".$fullname."</td>";
				$html.="<td>".$username."</td>";
				$html.="<td>".$password."</td>";
				$html.="</tr>";
				
				//นำเข้าตารางข้อมูล
				$query = "insert into tbl_member(idcard,fullname,username,password,bank_no) values('".$idcard."','".$fullname."','".$username."','".$password."','".$bank_no."')";
				$mysqli->query($query);

				$query_del = "DELETE FROM tbl_member WHERE username='ชื่อผู้ใช้งาน';";
				$mysqli->query($query_del);

	        }

		}

		$html.="</tbody></table>";
		echo $html;
		//echo "<br />Data Inserted in dababase";
		echo"<script language='JavaScript'>";
		echo"alert('นำเข้าข้อมูลเรียบร้อย');";
		//echo "history.back()";
		echo"</script>";	
		//exit();

	}else { 
		//die("<br/>Sorry, File type is not allowed. Only Excel file."); 
		echo"<script language='JavaScript'>";
		echo"alert('คำเตือน !, ชนิดไฟล์ไม่ถูกต้อง ชนิดไฟล์ต้องเป็น .csv และ .xls เท่านั้น');";
		echo "history.back()";
		echo"</script>";	
		//exit();

	}

}

?>

		</div>
		</div>
		<!-- /.card-body -->
	  </div>
	  <!-- /.card -->
	</div>
	<!-- /.col -->
  </div>
  <!-- /.row -->
</section>
<!-- /.content -->


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

<script>
  $(function () {
    $("#example1").DataTable();
    $('#example2').DataTable({
      "paging": true,
      "lengthChange": false,
      "searching": false,
      "ordering": true,
      "info": true,
      "autoWidth": false,
    });
  });
</script>
