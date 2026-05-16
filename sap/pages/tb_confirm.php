<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_confirm.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

//$title_page = tb_iw37n;
$tbl_policy = "tb_iw37n";
$myfile = "tb_confirm";

$filed1 = "id_workorder"; // id คีย์หลัก
$filed2 = "mntplan";
$filed3 = "workorder";
$filed4 = "bscstart";
$filed5 = "actfinish";
$filed6 = "systemstatus";
$filed7 = "opac";
$filed8 = "typework";
$filed9 = "operationst";
$filed10 = "machincst";
$filed11 = "workctr";
$filed12 = "worktime";
$filed13 = "unittime";
$filed14 = "mat";
$filed15 = "descriptionwork";
$filed16 = "functlocescrdip";
$filed17 = "descoftech";
$filed18 = "nowork";


//หากมีการกดปุ่มบันทึก
if ($_REQUEST['op'] == "save") {
     //ตรวจสอบการกรอกข้อมูลว่ามีการดำเนินการกรอกข้อมูลแล้วหรือยัง
     $sql = "SELECT * FROM $tbl_policy WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
     $result_chk = $link->query($sql);
	 //echo $sql;

     // หากมีการกรอกข้อมูลแล้วให้ดำเนินการ Update
     if ($result_chk->num_rows > 0) {
          //Update  ตารางหลัก
          $sqlupdate_main = "UPDATE $tbl_policy SET ";
          $sqlupdate_main .= " $filed1='" . $_REQUEST[$filed1] . "',$filed2='" . $_REQUEST[$filed2] . "',$filed3='" . $_REQUEST[$filed3] . "',$filed4='" . $_REQUEST[$filed4] . "',$filed5='" . $_REQUEST[$filed5] . "',$filed6='" . $_REQUEST[$filed6] . "',$filed7='" . $_REQUEST[$filed7] . "',$filed8='" . $_REQUEST[$filed8] . "',$filed9='" . $_REQUEST[$filed9] . "',$filed10='" . $_REQUEST[$filed10] . "',$filed11='" . $_REQUEST[$filed11] . "',$filed12='" . $_REQUEST[$filed12] . "',$filed13='" . $_REQUEST[$filed13] . "',$filed14='" . $_REQUEST[$filed14] . "',$filed15='" . $_REQUEST[$filed15] . "',$filed16='" . $_REQUEST[$filed16] . "',$filed17='" . $_REQUEST[$filed17] . "',$filed18='" . $_REQUEST[$filed18] . "' ";
          $sqlupdate_main .= " WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
          $result = $link->query($sqlupdate_main);
		  //echo $sqlupdate_main;
     } else {
          $record_date = date("Y-m-d H:i:s");
          //ดำเนินการเพิ่มข้อมูลลงในตารางหลัก
          $sqlinsert_main = "INSERT $tbl_policy ($filed1,$filed2,$filed3,$filed4,$filed5,$filed6,$filed7,$filed8,$filed9,$filed10,$filed11,$filed12,$filed13,$filed14,$filed15,$filed16,$filed17,$filed18) VALUES ('" . $_REQUEST[$filed1] . "','" . $_REQUEST[$filed2] . "','" . $_REQUEST[$filed3] . "','" . $_REQUEST[$filed4] . "','" . $_REQUEST[$filed5] . "','" . $_REQUEST[$filed6] . "','" . $_REQUEST[$filed7] . "','" . $_REQUEST[$filed8] . "','" . $_REQUEST[$filed9] . "','" . $_REQUEST[$filed10] . "','" . $_REQUEST[$filed11] . "','" . $_REQUEST[$filed12] . "','" . $_REQUEST[$filed13] . "','" . $_REQUEST[$filed14] . "','" . $_REQUEST[$filed15] . "','" . $_REQUEST[$filed16] . "','" . $_REQUEST[$filed17] . "','" . $_REQUEST[$filed18] . "')";
          $result = $link->query($sqlinsert_main);
		  //echo $sqlupdate_main;
     }

     //ย้อนกลับไปที่หน้า Policy นั้นๆ 
	 //echo "Swal.fire('Any fool can use a computer')";
     echo "<script>Swal.fire('Success!','You clicked the button!','success')</script>";
     //echo '<script>Swal.fire("Success!","' . $txt . '","success").then((value)=>{ window.location.href = "index.php?module=' . $myfile . '"; }); </script>';
     //echo '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=index.php?module='.$tbl_policy.'">';
     //exit;
}

//หากมีการกดปุ่มลบ
if ($_REQUEST['op'] == "del") {
	 $sql_del = "DELETE FROM $tbl_policy WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
     $link->query($sql_del);

     echo "<script>Swal.fire('Success!','You clicked the button!','success')</script>";
	 //echo "ลบข้อมูลเรียบร้อย";
     //echo '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=index.php?module='.$tbl_policy.'">';
     //exit;
}

?>

                    <div class="container-fluid">
                        <h1 class="mt-4"><?php echo $_REQUEST['module']?></h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item"><a href="index.php">Dashboard</a></li>
                            <li class="breadcrumb-item active"><?php echo $_REQUEST['module']?></li>
                        </ol>
                        <div class="card mb-4">
                            <div class="card-body">ตารางรายการข้อมูล <?php echo $_REQUEST['module']?></div>
                        </div>
                        <div class="card mb-4">
                            <div class="card-header">
							<i class="fas fa-table mr-1"></i><?php echo $_REQUEST['module']?>
								<div class="float-right">
								<a href="#" role="button" class="btn btn-info btn-create float-right" data-toggle="modal" data-target=".preview"><i class="far fa-id-card nav-icon"></i>&nbsp;คำอธิบาย</a>
								<a href="#" role="button" class="btn btn-warning btn-create float-right" data-toggle="modal" data-target=".preview"><i class="far fa-id-card nav-icon"></i>&nbsp;ส่งออกไฟล์ข้อมูล</a>
								<a href="<?php $PHP_SELF ?>index.php?module=<?php echo $tbl_policy;?>_imports" role="button" class="btn btn-success btn-success float-right"><i class="fa fa-download nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a>
								<!-- <a href="pages/tb_equipment_imports.php" role="button" class="btn btn-success btn-success float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-download nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a> -->
								<a href="pages/<?php echo $tbl_policy;?>_form.php" role="button" class="btn btn-dark btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;สร้างใหม่</a>
								</div>
							</div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='100'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th><?php echo $filed1;?></th>
                                                <th><?php echo $filed2;?></th>
                                                <th><?php echo $filed3;?></th>
                                                <th><?php echo $filed4;?></th>
                                                <th><?php echo $filed5;?></th>
                                                <th><?php echo $filed6;?></th>
                                                <th>action</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th><?php echo $filed1;?></th>
                                                <th><?php echo $filed2;?></th>
                                                <th><?php echo $filed3;?></th>
                                                <th><?php echo $filed4;?></th>
                                                <th><?php echo $filed5;?></th>
                                                <th><?php echo $filed6;?></th>
                                                <th>action</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?php
$strSQL = "SELECT * FROM $tbl_policy;";
$query = mysqli_query($link, $strSQL);
//echo $strSQL;
while($result = mysqli_fetch_array($query))
{
?>
                                            <tr>
                                                <td><?php echo $result[$filed1];?></td>
                                                <td><?php echo $result[$filed2];?></td>
                                                <td><?php echo $result[$filed3];?></td>
                                                <td><?php echo $result[$filed4];?></td>
                                                <td><?php echo $result[$filed5];?></td>
                                                <td><?php echo $result[$filed6];?></td>
                                                <td align="center">
												<a href="pages/<?php echo $tbl_policy;?>_form.php?op=edit&<?php echo $filed1;?>=<?php echo $result[$filed1];?>" data-id="<?php echo $result[$filed1]; ?>" data-name="<?php echo $result[$filed2]; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit btn-success" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-check"></i> Confirm</a>
												<a href="pages/<?php echo $tbl_policy;?>_form.php?op=del&<?php echo $filed1;?>=<?php echo $result[$filed1];?>" data-id="<?php echo $result[$filed1]; ?>" data-name="<?php echo $result[$filed2]; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit btn-warning" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-trash "></i> ลบ</a>

												</td>
                                            </tr>
<?php } ?>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

	<div class="modal fade preview" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel">
		<div class="modal-dialog modal-sm">
			<div class="modal-content">
				<div class="modal-body">
					<b>การเตรียม file</b><br>
					1.ดาวน์โหลด แบบฟอร์ม<br>
					2.กรอกรายชื่อ ตามแบบฟอร์ม<br>
					3.save file เป็นนามสกุล CSV<br>
					4.เปิด file ด้วยโปรแกรม notepad<br>
					5.save as และ เปลี่ยน Encoding เป็น UTF-8<br>
				</div>
			</div>
		</div>
	</div>

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
