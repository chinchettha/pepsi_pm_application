<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/user.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "ช้อมูลพนักงาน";
$tbl_policy = "tbworkcenter";
$myfile = "user";
?>

                    <div class="container-fluid">
                        <h1 class="mt-4"><?php echo $title_page;?></h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item"><a href="index.php">Dashboard</a></li>
                            <li class="breadcrumb-item active"><?php echo $title_page;?></li>
                        </ol>
                        <div class="card mb-4">
                            <div class="card-body">ตารางรายการข้อมูล <?php echo $title_page;?></div>
                        </div>
                        <div class="card mb-4">
                            <div class="card-header">
							<i class="fas fa-table mr-1"></i><?php echo $title_page;?>
								<div class="float-right">
								<!-- <a href="#" role="button" class="btn btn-info btn-create float-right" data-toggle="modal" data-target=".preview"><i class="far fa-id-card nav-icon"></i>&nbsp;คำอธิบาย</a>
								<a href="#" role="button" class="btn btn-warning btn-create float-right" data-toggle="modal" data-target=".preview"><i class="far fa-id-card nav-icon"></i>&nbsp;ส่งออกไฟล์ข้อมูล</a>
								<a href="<?php $PHP_SELF ?>index.php?module=<?php echo $myfile;?>_imports" role="button" class="btn btn-success btn-success float-right"><i class="fa fa-download nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a>
								<a href="pages/tb_equipment_imports.php" role="button" class="btn btn-success btn-success float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-download nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a>
								<a href="pages/<?php echo $myfile;?>_form.php" role="button" class="btn btn-info btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;สร้างใหม่</a> -->
								</div>
							</div>

                            <div class="card-body">
                                <div class="table-responsive">

<?php
//รวมเวลาทำงาน
//include('count_worktime.php');
?>
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='100'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>รหัสพนักงาน</th>
                                                <th>ชื่อ-สกุล</th>
                                                <th>กลุ่มงาน</th>
                                                <th>ตำแหน่ง</th>
                                                <th>สถานะการใช้งาน</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>รหัสพนักงาน</th>
                                                <th>ชื่อ-สกุล</th>
                                                <th>กลุ่มงาน</th>
                                                <th>ตำแหน่ง</th>
                                                <th>สถานะการใช้งาน</th>
                                                <th>Action</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>
										<?php
										$strSQL = "SELECT * FROM $tbl_policy;";
										$query = mysqli_query($link, $strSQL);
										//echo $strSQL;
										while($result = mysqli_fetch_array($query))
										{
											switch ($result['UserST']) {
												case "A":
													$result['UserST']="ผู้ดูแลระบบ";
													break;
												case "U":
													$result['UserST']="ผู้ใช้งานทั่วไป";
													break;
												case "W":
													$result['UserST']="ช่าง";
													break;
											}
										?>
                                            <tr>
                                                <td><a href="index.php?module=calendar_wkctr&wkctr=<?php echo $result['wkctr'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="เปิดตารางงานในปฏิทิน"><?php echo $result['wkctr'];?></a></td>
                                                <td><?php echo $result['titlewkctr'].$result['namewkctr']." ".$result['surnamewkctr'];?></td>
                                                <td>
												<?php 
												/*$strSQL = "SELECT * FROM view_workcenter WHERE tbworkcenter.idwkctr='".$result['idwkctr']."' ";*/

												$strSQL2 = "SELECT
													tbposition.position AS position,
													tbwkctrgroup.wkctrgroup AS wkctrgroup,
													tbwkctrgroup.wkctrdescription AS wkctrdescription,
													tbwkctrtype.wkctrtype AS wkctrtype,
													tbdepartment.department AS department,
													tbwkctrstatus.wkstatusdes AS wkstatusdes,
													tbuserst.userstdesc AS userstdesc,
													tbworkcenter.idwkctr,
													tbworkcenter.iddepartment,
													tbworkcenter.idposition,
													tbworkcenter.idwkctrgroup,
													tbworkcenter.idwkctrtype,
													tbworkcenter.UserST,
													tbworkcenter.workstatus
													from ((((((`tbworkcenter` 
													left join `tbwkctrtype` on((`tbworkcenter`.`idwkctrtype` = `tbwkctrtype`.`idwkctrtype`))) 
													left join `tbwkctrgroup` on((`tbworkcenter`.`idwkctrgroup` = `tbwkctrgroup`.`idwkctrgroup`))) 
													left join `tbposition` on((`tbworkcenter`.`idposition` = `tbposition`.`idposition`))) 
													left join `tbdepartment` on((`tbworkcenter`.`iddepartment` = `tbdepartment`.`iddepartment`))) 
													left join `tbwkctrstatus` on((`tbworkcenter`.`workstatus` = `tbwkctrstatus`.`workstatus`))) 
													join `tbuserst` on((`tbworkcenter`.`UserST` = `tbuserst`.`userst`)))
													WHERE tbworkcenter.idwkctr='".$result['idwkctr']."'
													";
												$query2 = mysqli_query($link, $strSQL2);
												$result2 = mysqli_fetch_array($query2);
												echo $result2['wkctrgroup']." ".$result2['wkctrdescription'];
												?>
												</td>
                                                <td><?php echo $result2['position'];?></td>
                                                <td><?php echo $result['UserST'];?></td>
                                                <td align="center">
												<a href="index.php?module=calendar_wkctr&wkctr=<?php echo $result['wkctr'];?>" data-id="<?php echo $result['idwkctr']; ?>" data-name="<?php echo $result['idwkctr']; ?>" role="button" class="btn btn-outline-info btn-sm btn-edit" data-toggle="" data-html="true" data-target="" data-placement="top" title="เปิดตารางงาน"><i class="fa fa-eye"></i> เปิดตารางงาน</a>
												<a href="<?php $PHP_SELF ?>index2.php?module=user_form&op=edit&id=<?php echo $result['idwkctr'];?>" data-id="<?php echo $result['idwkctr']; ?>" data-name="<?php echo $result['idwkctr']; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit" data-toggle="" data-html="true" data-target="" data-placement="top" title="แก้ไขข้อมูล"><i class="fa fa-edit"></i> แก้ไข</a>
												<a href="<?php $PHP_SELF ?>index2.php?module=user_form&op=del&id=<?php echo $result['idwkctr'];?>" data-id="<?php echo $result['idwkctr']; ?>" data-name="<?php echo $result['idwkctr']; ?>" role="button" class="btn btn-outline-danger btn-sm btn-del" data-toggle="" data-target=""><i class="fa fa-trash"></i> ลบ</a>
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



