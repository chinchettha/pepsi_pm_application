<?php
$title_page = "Summary Weekly";
$tbl_policy = "view_confrim";
?>

<div class="container-fluid">
	<h1 class="mt-4"><?php echo $title_page;?></h1>
	<ol class="breadcrumb mb-4">
		<li class="breadcrumb-item"><a href="index.php">Dashboard</a></li>
		<li class="breadcrumb-item active"><?php echo $title_page;?></li>
	</ol>

	<div class="card mb-12">
		<div class="card-body">
		<!-- <img src="img/ex-chart.jpg" width="100%"> -->
		<?php 
		//include('W_summary_weekly_chart.php');
		include('W_summary_weekly_chart2.php');
		?>
		<br><br>
		<br>
		<center>
		<a href="pages/W_summary_weekly_chart2_full.php" target="_blank">ดูกราฟแบบขยาย</a>
		<!-- <a href="pages/W_summary_weekly_chart_full.php" role="button" class="btn btn-dark btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-chart nav-icon"></i>ดูกราฟแบบขยาย</a> -->
		</center>
		</div>
	</div>

	<div class="table-responsive">
		
		<table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='100'>
			<thead>
				<tr class="table-info"><th colspan='12'><center>อยู่ระหว่างทดลอง</center></tr>
				<tr class="table-info">
					<th>No.</th>
					<th>Work Center</th>
					<th><small>ZB02</small><br>PM</th>
					<th><small>ZB01/ZB05</small><br>Reactive</th>
					<th><small>ZB02</small><br>RCA</th>
					<th>Wo</th>
					<th>HR hour</th>
					<th>OT hour</th>
					<th>%PM</th>
					<th>%Reactive</th>
					<th>%RCA</th>
					<th>Total</th>
				</tr>
			</thead>
			<tfoot>
				<tr class="table-active">
					<th>No.</th>
					<th>Work Center</th>
					<th><small>ZB02</small><br>PM</th>
					<th><small>ZB01/ZB05</small><br>Reactive</th>
					<th><small>ZB02</small><br>RCA</th>
					<th>Wo</th>
					<th>HR hour</th>
					<th>OT hour</th>
					<th>%PM</th>
					<th>%Reactive</th>
					<th>%RCA</th>
					<th>Total</th>
				</tr>
			</tfoot>
			<tbody>
<?php
$i=0;
$strSQL = "SELECT
tbmanhours.idmanhour,
tbmanhours.idwkctr,
tbmanhours.workday,
tbmanhours.wh,
tbmanhours.ot1,
tbmanhours.ot15,
tbmanhours.ot1hol,
tbmanhours.ot2,
tbmanhours.ot3,
tbworkcenter.wkctr
FROM
tbmanhours
LEFT JOIN tbworkcenter ON tbmanhours.idwkctr = tbworkcenter.idwkctr
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

				//** หา ZB !='ZB029'
				$sqlPM="SELECT * FROM view_order WHERE wkctr = '".$result['wkctr']."' AND wktype !='ZB029' ";
				$queryPM = mysqli_query($link, $sqlPM);
				$resultPM = mysqli_fetch_array($queryPM);
				if ($resultPM['untime']=="H"){
					$PM=$resultPM['actwork']*60;
				}else{
					$PM=$resultPM['actwork'];
				}

				//** หา ZB ZB01 หรือ ZB05
				$sqlRea="SELECT * FROM view_order WHERE wkctr = '".$result['wkctr']."' AND wktype ='ZB01' OR wktype ='ZB05' ";
				$queryRea = mysqli_query($link, $sqlRea);
				$resultRea = mysqli_fetch_array($queryRea);
				if ($resultRea['untime']=="H"){
					$Rea=$resultRea['actwork']*60;
				}else{
					$Rea=$resultRea['actwork'];
				}
				//** หา RCA
				$sqlRCA="SELECT * FROM view_confirmation WHERE wkctr = '".$result['wkctr']."'  ";
				$queryRCA = mysqli_query($link, $sqlRCA);
				$resultRCA = mysqli_fetch_array($queryRCA);
				$RCA=$resultRCA['timewk'];

				$PM_T=$PM/$SummaryW;
				$Rea_T=$Rea/$SummaryW;
				$RCA_T=$RCA/$SummaryW;
				$TOTAL=$PM_T+$Rea_T+$RCA_T;
				?>
				<tr>
					<td><?php echo $i;?></td>
					<td title="<?php echo $resultPM['syst'];?><br><?php echo $resultPM['matdescrip'];?>" data-toggle="tooltip" data-html="true"><?php echo $result['wkctr'];?></td>
					<td title="ZB02 ทั้งหมด ยกเว้น  029" data-toggle="tooltip" data-html="true"><?php echo $resultPM['actwork']." ".$resultPM['untime'];?></td>
					<td title="ZB01/ZB05" data-toggle="tooltip" data-html="true"><?php echo $resultRea['actwork']." ".$resultRea['untime'];?></td>
					<td title="ZB02 เฉพาะ 029 RCA เท่านั่น<br> เวลาที่ได้มาจากการ confirm ปิดงานใน SAP  แยกเป็นแต่ละ type (ZB01/ZB02/ZB05) <br>- Status 'TECO' ไม่มีเวลา  <br>- Status 'TECO CPNF' " data-toggle="tooltip" data-html="true"><?php echo $resultRCA['timewk']." ".$resultRCA['unitc'];?></td>
					<td class='text-warning' title="จำนวน Work order<br>ที่มีชื่อปรากฎอยู่ใน Work order ใบนั้นๆ" data-toggle="tooltip" data-html="true">Wo</td>
					<td title="เวลาการทำงานที่ได้มาจาก HR"data-toggle="tooltip" data-html="true"><?php echo $SummaryW;?></td>
					<td title="ได้มาจาก HR report เฉพาะชั่วโมง OT" data-toggle="tooltip" data-html="true"><?php echo $OTnet;?></td>
					<td  class='text-warning' title="ได้มาจาก<br>(PM/HR hour)" data-toggle="tooltip" data-html="true" ><?php echo number_format($PM_T,2);?></td>
					<td  class='text-warning' title="ได้มาจาก<br>(Reactive/HR hour)" data-toggle="tooltip" data-html="true"><?php echo number_format($Rea_T,2);?></td>
					<td  class='text-warning' title="ได้มาจาก<br>(RCA/HR hour)" data-toggle="tooltip" data-html="true"><?php echo number_format($RCA_T,2);?></td>
					<td  class='text-success' title="ได้มาจาก<br>(%PM+%Reactive+%RCA)" data-toggle="tooltip" data-html="true"><?php echo number_format($TOTAL,2);?></td>
				</tr>
			<?php } ?>
			</tbody>
		</table>
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
