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
                                                <th>วันที่ทำงาน</th>
                                                <th>จำนวนชั่วโมงที่ทำงาน</th>
                                                <th>จำนวน OT1</th>
                                                <th>จำนวน OT1.5</th>
                                                <th>จำนวน OT1HOL</th>
                                                <th>จำนวน OT2</th>
                                                <th>จำนวน OT3</th>
                                                <!-- <th>ตัวเลือก</th> -->
                                            </tr>
                                        </thead>
                                        <tfoot>
                                            <tr class="table-active">
                                                <th>ลำดับ</th>
                                                <th>วันที่ทำงาน</th>
                                                <th>จำนวนชั่วโมงที่ทำงาน</th>
                                                <th>จำนวน OT1</th>
                                                <th>จำนวน OT1.5</th>
                                                <th>จำนวน OT1HOL</th>
                                                <th>จำนวน OT2</th>
                                                <th>จำนวน OT3</th>
                                                <!-- <th>ตัวเลือก</th> -->
                                            </tr>
                                        </tfoot>
                                        <tbody>

											<?php
											$i=0;
											$strSQL = " SELECT
											count(tbmanhours.idwkctr) AS cnt_idwkctr,
											tbmanhours.idwkctr AS idwkctr,
											tbmanhours.workday AS workday,
											tbmanhours.wh AS wh,
											sum(tbmanhours.ot1) AS ot1,
											sum(tbmanhours.ot15) AS ot15,
											sum(tbmanhours.ot1hol) AS ot1hol,
											sum(tbmanhours.ot2) AS ot2,
											sum(tbmanhours.ot3) AS ot3
											FROM tbmanhours
											WHERE idwkctr='".$_SESSION['mem_id']."'
											GROUP BY
											tbmanhours.workday ";
											$query = mysqli_query($link, $strSQL);
											//echo $strSQL;
											while($result = mysqli_fetch_array($query))
											{
											$i++;
											$workday  = date("d.m.Y", $result['workday']);
											$endday  = date("d.m.Y", $result['workday']);
											?>
                                            <tr>
                                                <td><?php echo $i;?></td>
                                                <td><?php echo $workday;?></td>
                                                <td><?php echo $result['wh'];?></td>
                                                <td><?php echo $result['ot1'];?></td>
                                                <td><?php echo $result['ot15'];?></td>
                                                <td><?php echo $result['ot1hol'];?></td>
                                                <td><?php echo $result['ot2'];?></td>
                                                <td><?php echo $result['ot3'];?></td>
                                                <!-- <td>view</td> -->
                                            </tr>
										<?php } ?>

                                        </tbody>
                                    </table>
                                </div>
                            </div>

</div>
