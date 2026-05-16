<?php
$title_page = "Work time view";
$tbl_policy = "view_confrim";
?>

<div class="container-fluid">
	<h1 class="mt-4"><?php echo $title_page;?></h1>
	<ol class="breadcrumb mb-4">
		<li class="breadcrumb-item"><a href="index.php">Dashboard</a></li>
		<li class="breadcrumb-item active"><?php echo $title_page;?></li>
	</ol>
	<!-- <div class="card mb-4">
		<div class="card-body">This page is an example of using the light side navigation option. By appending the <code>.sb-sidenav-light</code> class to the <code>.sb-sidenav</code> class, the side navigation will take on a light color scheme. The <code>.sb-sidenav-dark</code> is also available for a darker option.</div>
	</div> -->

                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                                        <thead>
                                            <tr class="table-info">
                                                <th>ลำดับ</th>
                                                <th>รหัสแผน</th>
                                                <th>วันที่เริ่ม</th>
                                                <th>วันที่สิ้นสุด</th>
                                                <th>ผู้จัด</th>
                                                <th>หมายเหตุ/เหตุผล</th>
                                                <th>ตัวเลือก</th>
                                            </tr>
                                        </thead>
                                        <tfoot>
                                            <tr class="table-active">
                                                <th>ลำดับ</th>
                                                <th>รหัสแผน</th>
                                                <th>วันที่เริ่ม</th>
                                                <th>วันที่สิ้นสุด</th>
                                                <th>ผู้จัด</th>
                                                <th>หมายเหตุ/เหตุผล</th>
                                                <th>ตัวเลือก</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>

											<?php
											$i=0;
											$strSQL = "select `tbplangingwork`.`idplanw` AS `idplanw`,`tbplangingwork`.`idiw37` AS `idiw37`,`tbplangingwork`.`wkctrpw` AS `wkctrpw`,`tbplangingwork`.`pwcomment` AS `pwcomment`,`view_workcenter`.`idwkctr` AS `idwkctr`,`view_workcenter`.`titlewkctr` AS `titlewkctr`,`view_workcenter`.`namewkctr` AS `namewkctr`,`view_workcenter`.`surnamewkctr` AS `surnamewkctr`,`view_workcenter`.`titlewkctreng` AS `titlewkctreng`,`view_workcenter`.`namewkctreng` AS `namewkctreng`,`view_workcenter`.`startwork` AS `startwork`,`view_workcenter`.`idposition` AS `idposition`,`view_workcenter`.`position` AS `position`,`view_workcenter`.`plnt` AS `plnt`,`view_workcenter`.`cat` AS `cat`,`view_workcenter`.`resp` AS `resp`,`view_workcenter`.`idwkctrgroup` AS `idwkctrgroup`,`view_workcenter`.`wkctrgroup` AS `wkctrgroup`,`view_workcenter`.`wkctrdescription` AS `wkctrdescription`,`view_workcenter`.`idwkctrtype` AS `idwkctrtype`,`view_workcenter`.`wkctrtype` AS `wkctrtype`,`view_workcenter`.`wkctrdate` AS `wkctrdate`,`view_workcenter`.`wkctrtel` AS `wkctrtel`,`view_workcenter`.`wkctrmail` AS `wkctrmail`,`view_workcenter`.`labourcost` AS `labourcost`,`view_workcenter`.`iddepartment` AS `iddepartment`,`view_workcenter`.`department` AS `department`,`view_workcenter`.`workstatus` AS `workstatus`,`view_workcenter`.`wkstatusdes` AS `wkstatusdes`,`view_workcenter`.`surnamewkctreng` AS `surnamewkctreng`,`view_workcenter`.`userst` AS `UserST`,`view_workcenter`.`userstdesc` AS `userstdesc`,`view_workcenter`.`wkctr` AS `wkctr`,`view_workcenter`.`idwklevel` AS `idwklevel`,`view_workcenter`.`wklevel` AS `wklevel`,`view_workcenter`.`pass` AS `pass` from (`view_workcenter` join `tbplangingwork` on((`tbplangingwork`.`wkctr` = `view_workcenter`.`wkctr`))) WHERE view_workcenter.wkctr = '".$_SESSION['username']."' ";
//$strSQL = "SELECT tbplangingwork.*,tbiw37n.* FROM tbplangingwork INNER JOIN tbiw37n ON  tbplangingwork.idiw37 = tbiw37n.idiw37  WHERE tbplangingwork.wkctr = '".$_SESSION['username']."' ";
											$query = mysqli_query($link, $strSQL);
											//echo $strSQL;
											while($result = mysqli_fetch_array($query))
											{
											$i++;
											$startday  = date("d.m.Y", $result['tbiw37n.bscstart']);
											$endday  = date("d.m.Y", $result['tbiw37n.actfinish']);
											?>
                                            <tr>
                                                <td><?php echo $i;?></td>
                                                <td><?php echo $result['tbiw37n.mntplan'];?></td>
                                                <td><?php echo $startday;?></td>
                                                <td><?php echo $endday;?></td>
                                                <td><?php echo $result['tbiw37n.wkctrpw'];?></td>
                                                <td><?php echo $result['tbiw37n.pwcomment'];?></td>
                                                <td>view</td>
                                            </tr>
										<?php } ?>

                                        </tbody>
                                    </table>
                                </div>
                            </div>

</div>
