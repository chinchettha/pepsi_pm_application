<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_equipment.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "view_confirm";
//search Data Table TBiw37n
$strSQL = "SELECT * FROM view_confrim order by idwkstatus ASC ";
/*
$strSQL = "
SELECT
tbiw37n.idiw37 AS idiw37,
tbiw37n.wkorder AS wkorder,
tbiw37n.mntplan AS mntplan,
tbiw37n.wktype AS wktype,
tbiw37n.mat AS mat,
tbiw37n.bscstart AS bscstart,
tbiw37n.actfinish AS actfinish,
tbiw37n.systemstatus AS systemstatus,
tbiw37n.opac AS opac,
tbiw37n.operationshorttext AS operationshorttext,
tbiw37n.ostdescription AS ostdescription,
tbiw37n.cknow AS cknow,
tbiw37n.wkctr AS wkctr,
tbiw37n.`work` AS `work`,
tbiw37n.actwork AS actwork,
tbiw37n.untime AS untime,
tbiw37n.equipment AS equipment,
tbiw37n.equdescrip AS equdescrip,
tbiw37n.functionalloc AS functionalloc,
tbiw37n.funldescrip AS funldescrip,
tbcofirm.idclose AS idclose,
tbcofirm.confirmation AS confirmation,
tbcofirm.wkctr AS wkctrcon,
tbcofirm.stdate AS stdate,
tbcofirm.endate AS endate,
tbcofirm.timeclose AS timeclose,
tbworkcenter.titlewkctr AS titlewkctr,
tbworkcenter.namewkctr AS namewkctr,
tbworkcenter.surnamewkctr AS surnamewkctr,
tbworkcenter.titlewkctreng AS titlewkctreng,
tbworkcenter.namewkctreng AS namewkctreng,
tbworkcenter.surnamewkctreng AS surnamewkctreng,
tbworkcenter.startwork AS startwork,
tbworkcenter.idposition AS idposition,
tbworkcenter.wkctr AS wkctrwork,
tbworkcenter.plnt AS plnt,
tbworkcenter.cat AS cat,
tbworkcenter.resp AS resp,
tbworkcenter.idwkctrgroup AS idwkctrgroup,
tbworkcenter.idwkctrtype AS idwkctrtype,
tbworkcenter.wkctrdate AS wkctrdate,
tbworkcenter.wkctrtel AS wkctrtel,
tbworkcenter.wkctrmail AS wkctrmail,
tbworkcenter.labourcost AS labourcost,
tbworkcenter.UserST AS UserST,
tbworkcenter.`Password` AS `Password`,
tbworkcenter.workstatus AS workstatus,
tbwkstatus.idwkstatus AS idwkstatus,
tbwkstatus.syst AS syst,
tbmoveplan.idmplan AS idmplan,
tbmoveplan.cday AS cday,
tbmoveplan.mday AS mday,
tbmoveplan.mwkctr AS mwkctr,
tbmoveplan.reasoncode AS reasoncode,
tbreason.reasonname AS reasonname,
tbmoveplan.resoncom AS resoncom,
tbmoveplan.mpcount AS mpcount,
tbworkcenter.iddepartment AS iddepartment,
tbcofirm.cwkctr AS cwkctr
from (((((`tbiw37n` left join `tbcofirm` on((`tbiw37n`.`idiw37` = `tbcofirm`.`idiw37`))) left join `tbworkcenter` on((`tbcofirm`.`cwkctr` = `tbworkcenter`.`idwkctr`))) left join `tbwkstatus` on((`tbiw37n`.`syst` = `tbwkstatus`.`syst`))) left join `tbmoveplan` on((`tbiw37n`.`idiw37` = `tbmoveplan`.`idiw37`))) left join `tbreason` on((`tbmoveplan`.`reasoncode` = `tbreason`.`reasoncode`))) ;";
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
                                                <th>no</th>
                                                <th>wkorder</th>
                                                <th>mntplan</th>
                                                <th>bscstart</th>
                                                <th>systemstatus</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>no</th>
                                                <th>wkorder</th>
                                                <th>mntplan</th>
                                                <th>bscstart</th>
                                                <th>systemstatus</th>
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
                                                <td><a href="" data-toggle="tooltip" data-html="true" data-placement="top" title="เปิดดู"><?php echo $result['wkorder'];?></a></td>
                                                <td><a href="" data-toggle="tooltip" data-html="true" data-placement="top" title="เปิดดู"><?php echo $result['mntplan'];?></a></td>
                                                <td><?php echo date("d.m.Y", $result['bscstart']);?></td>
                                                <td><?php echo $result['systemstatus'];?></td>
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
