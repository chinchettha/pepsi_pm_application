<?php
$title_page = "Manhour HR";
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

	<div class="table-responsive">
		<table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='100'>
			<thead>
				<tr class="table-info">
					<th>ลำดับ</th>
					<th>วันที่ทำงาน</th>
					<th>ชื่อ - สกุล (ไทย)</th>
					<th>ตำแหน่ง</th>
					<th>จำนวนชั่วโมงที่ทำงาน</th>
					<th>จำนวน OT1</th>
					<th>จำนวน OT1.5</th>
					<th>จำนวน OT1HOL</th>
					<th>จำนวน OT2</th>
					<th>จำนวน OT3</th>
					<th>Summary/W</th>
					<th>OT net</th>
					<!-- <th>ตัวเลือก</th> -->
				</tr>
			</thead>
			<tfoot>
				<tr class="table-active">
					<th>ลำดับ</th>
					<th>วันที่ทำงาน</th>
					<th>ชื่อ - สกุล (ไทย)</th>
					<th>ตำแหน่ง</th>
					<th>จำนวนชั่วโมงที่ทำงาน</th>
					<th>จำนวน OT1</th>
					<th>จำนวน OT1.5</th>
					<th>จำนวน OT1HOL</th>
					<th>จำนวน OT2</th>
					<th>จำนวน OT3</th>
					<th>Summary/W</th>
					<th>OT net</th>
					<!-- <th>ตัวเลือก</th> -->
				</tr>
			</tfoot>
			<tbody>
<?php
$i=0;
$strSQL = "SELECT
tbworkcenter.wkctr,
tbworkcenter.titlewkctr,
tbworkcenter.namewkctr,
tbworkcenter.surnamewkctr,
tbworkcenter.titlewkctreng,
tbworkcenter.namewkctreng,
tbworkcenter.surnamewkctreng,
tbposition.position,
tbmanhours.idmanhour,
tbmanhours.idwkctr,
tbmanhours.workday,
tbmanhours.wh,
tbmanhours.ot1,
tbmanhours.ot15,
tbmanhours.ot1hol,
tbmanhours.ot2,
tbmanhours.ot3

FROM
tbmanhours
LEFT JOIN tbworkcenter ON tbmanhours.idwkctr = tbworkcenter.idwkctr
LEFT JOIN tbposition ON tbworkcenter.idposition = tbposition.idposition
where wkctr='$_SESSION[wkctr]'
";
				$query = mysqli_query($link, $strSQL);
				//echo $strSQL;
				while($result = mysqli_fetch_array($query))
				{
				$i++;
				$workday  = date("d.m.Y", $result['workday']);
				$endday  = date("d.m.Y", $result['workday']);
				$SummaryW=$result['wh']+$result['ot1']+$result['ot15']+$result['ot1hol']+$result['ot2']+$result['ot3'];
				$OTnet=$result['ot1']+$result['ot15']+$result['ot1hol']+$result['ot2']+$result['ot3'];
				$fullname_th=$result['titlewkctr'].$result['namewkctr']."  ".$result['surnamewkctr'];
				?>
				<tr>
					<td><?php echo $i;?></td>
					<td><?php echo $workday;?></td>
					<td><?php echo $fullname_th;?></td>
					<td><?php echo $result['position'];?></td>
					<td><?php echo $result['wh'];?></td>
					<td><?php echo $result['ot1'];?></td>
					<td><?php echo $result['ot15'];?></td>
					<td><?php echo $result['ot1hol'];?></td>
					<td><?php echo $result['ot2'];?></td>
					<td><?php echo $result['ot3'];?></td>
					<td><?php echo $SummaryW;?></td>
					<td><?php echo $OTnet;?></td>
					<!-- <td>view</td> -->
				</tr>
			<?php } ?>
			</tbody>
		</table>
	</div>

</div>
