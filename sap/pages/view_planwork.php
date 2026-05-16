<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_equipment.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "view_planwork";
$strSQL = "SELECT * FROM view_planwork ";
/*
$strSQL = "select `tbplangingwork`.`idplanw` AS `idplanw`,
`tbplangingwork`.`idiw37` AS `idiw37`,
`tbplangingwork`.`wkctrpw` AS `wkctrpw`,
`tbplangingwork`.`pwcomment` AS `pwcomment`,
`view_workcenter`.`idwkctr` AS `idwkctr`,
`view_workcenter`.`titlewkctr` AS `titlewkctr`,
`view_workcenter`.`namewkctr` AS `namewkctr`,
`view_workcenter`.`surnamewkctr` AS `surnamewkctr`,
`view_workcenter`.`titlewkctreng` AS `titlewkctreng`,
`view_workcenter`.`namewkctreng` AS `namewkctreng`,
`view_workcenter`.`startwork` AS `startwork`,
`view_workcenter`.`idposition` AS `idposition`,
`view_workcenter`.`position` AS `position`,
`view_workcenter`.`plnt` AS `plnt`,
`view_workcenter`.`cat` AS `cat`,
`view_workcenter`.`resp` AS `resp`,
`view_workcenter`.`idwkctrgroup` AS `idwkctrgroup`,
`view_workcenter`.`wkctrgroup` AS `wkctrgroup`,
`view_workcenter`.`wkctrdescription` AS `wkctrdescription`,
`view_workcenter`.`idwkctrtype` AS `idwkctrtype`,
`view_workcenter`.`wkctrtype` AS `wkctrtype`,
`view_workcenter`.`wkctrdate` AS `wkctrdate`,
`view_workcenter`.`wkctrtel` AS `wkctrtel`,
`view_workcenter`.`wkctrmail` AS `wkctrmail`,
`view_workcenter`.`labourcost` AS `labourcost`,
`view_workcenter`.`Password` AS `Password`,
`view_workcenter`.`iddepartment` AS `iddepartment`,
`view_workcenter`.`department` AS `department`,
`view_workcenter`.`workstatus` AS `workstatus`,
`view_workcenter`.`wkstatusdes` AS `wkstatusdes`,
`view_workcenter`.`surnamewkctreng` AS `surnamewkctreng`,
`view_workcenter`.`UserST` AS `UserST`,
`view_workcenter`.`userstdesc` AS `userstdesc`,
`view_workcenter`.`wkctr` AS `wkctr` 
from (`view_workcenter` 
join `tbplangingwork` on((`tbplangingwork`.`wkctr` = `view_workcenter`.`wkctr`)))
;";
//echo "SQL = ".$strSQL;
*/
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
								<a href="<?php $PHP_SELF ?>index.php?module=<?php echo $tbl_policy;?>_imports" role="button" class="btn btn-success btn-success float-right"><i class="fa fa-download nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a>
								<a href="pages/tb_equipment_imports.php" role="button" class="btn btn-success btn-success float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-download nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a>
								<a href="pages/<?php echo $tbl_policy;?>_form.php" role="button" class="btn btn-dark btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;สร้างใหม่</a> -->
								</div>
							</div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='100'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>idplanw</th>
                                                <th>idiw37</th>
                                                <th>รหัสช่าง</th>
                                                <th>ชื่อช่าง</th>
                                                <th>วันที่เริ่ม</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>idplanw</th>
                                                <th>idiw37</th>
                                                <th>รหัสช่าง</th>
                                                <th>ชื่อช่าง</th>
                                                <th>วันที่เริ่ม</th>
                                                <th>Action</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?php
$i=0;
$query = mysqli_query($link, $strSQL);
while($result = mysqli_fetch_array($query))
{
$i++;
?>
                                            <tr>
                                                <td><?php echo $i;?></td>
                                                <td><a href="" data-toggle="tooltip" data-html="true" data-placement="top" title="เปิดดู"><?php echo $result['idplanw'];?></a></td>
                                                <td><a href="" data-toggle="tooltip" data-html="true" data-placement="top" title="เปิดดู"><?php echo $result['idiw37'];?></a></td>
                                                <td><?php echo $result['titlewkctr'].$result['namewkctr']." ".$result['surnamewkctr'];?></td>
                                                <td><?php echo date("d.m.Y", $result['bscstart']);?></td>
                                                <td align="center">
												<a href="pages/view_confrim_view.php?op=edit&<?php echo $filed1;?>=<?php echo $result[$filed1];?>" data-id="<?php echo $result[$filed1]; ?>" data-name="<?php echo $result[$filed2]; ?>" role="button" class="btn btn-outline-info btn-sm btn-edit" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-eye"></i> เปิดดู</a>
												<!-- <a href="pages/<?php echo $tbl_policy;?>_form.php?op=del&<?php echo $filed1;?>=<?php echo $result[$filed1];?>" data-id="<?php echo $result[$filed1]; ?>" data-name="<?php echo $result[$filed2]; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-trash"></i> ลบ</a> -->
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
