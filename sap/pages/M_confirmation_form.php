<?
// Include File connect Database
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
require_once('../include/define.php');

$tb1 = "view_order";

$Events =  $_REQUEST["Event"]; //รับค่อ Ajax แบบ Post
$id =  $Events[0];



$SqlTB1 = " SELECT * FROM  $tb1 where  wkorder= '$id'  ";
$qrTB1 = mysqli_query($link, $SqlTB1) or die ("Error Query [".$SqlTB1."]");
$totalTB1 = mysqli_num_rows($qrTB1);

if($totalTB1 >0){
	$rsTB1 = mysqli_fetch_array($qrTB1);
	$idiw37 = $rsTB1["idiw37"];
?>
<!----- Show Order Detail --------->


<!-- SweetAlert2 -->
<link rel="stylesheet" href="plugins/sweetalert2-theme-bootstrap-4/bootstrap-4.min.css">
<link rel="stylesheet" href="js/jquery-ui.css">
<!-- Count %  -->
<link href="plugins/pace/pace-theme-big-counter.css" rel="stylesheet" />

<div class="container-fluid">
			<ul class="nav nav-tabs border-0" id="myTab" role="tablist">
				<li class="nav-item">
					<a class="nav-link active border border-primary border-bottom-0" id="WorkOrder-tab" data-toggle="tab" href="#WorkOrder" role="tab" aria-controls="WorkOrder" aria-selected="true">Work Order</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-warning border-bottom-0" id="TaskList-tab" data-toggle="tab" href="#TaskList" role="tab" aria-controls="TaskList" aria-selected="false">Comfirmation</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-danger border-bottom-0" id="Machine-tab" data-toggle="tab" href="#Machine" role="tab" aria-controls="Machine" aria-selected="false">Images</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-danger border-bottom-0" id="Planning-tab" data-toggle="tab" href="#Planning" role="tab" aria-controls="Planning" aria-selected="false">Planning</a>
				</li>
				
			</ul>

			<div class="tab-content h-75">
				<div class="tab-pane h-100 p-3 active border border-primary" id="WorkOrder" role="tabpanel" aria-labelledby="WorkOrder-tab">
				<?php
					include("../modalPages/confirmTab1.php");
				?>		
				</div>
				<div class="tab-pane h-100 p-3 border border-warning" id="TaskList" role="tabpanel" aria-labelledby="TaskList-tab">
				<?php
					include("../modalPages/confirmTab2.php");
				?>			
				</div>
				<div class="tab-pane h-100 p-3 border border-danger" id="Machine" role="tabpanel" aria-labelledby="Planning-tab">
				<?php
					include("../modalPages/confirmTab3.php");
				?>			
				</div>
				<div class="tab-pane h-100 p-3 border border-danger" id="Planning" role="tabpanel" aria-labelledby="Machine-tab">
				<?php
					include("../modalPages/confirmTab4.php");
				?>			
				</div>
			</div>
		</div>
<!------- Show Order Detail  ------->
<?PHP  
}else {
    echo "ไม่พบเลข Work Order ที่ทำการค้นหา";
} // end if($totalTB1 >0){


?>

        <script src="pages/js/jquery-3.4.1.min.js" crossorigin="anonymous"></script>
        <script src="pages/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
        <script src="pages/js/scripts.js"></script>
        <script src="pages/js/Chart.min.js" crossorigin="anonymous"></script>
        <script src="pages/assets/demo/chart-area-demo.js"></script>
        <script src="pages/assets/demo/chart-bar-demo.js"></script>
        <script src="pages/js/jquery.dataTables.min.js" crossorigin="anonymous"></script>
        <script src="pages/js/dataTables.bootstrap4.min.js" crossorigin="anonymous"></script>
        <script src="pages/assets/demo/datatables-demo.js"></script>

	


<script src="sweetalert2/dist/sweetalert2.min.js"></script>
<script src="assets/js/member.js"></script>	
<!-- ///////////// -->

<!-- BEGIN Java Script for this page For normal Modal Popup -->	
<script src="js/custom.js"></script>
<!-- END Java Script for this page -->

<!-- Count %  -->
<script src="plugins/pace/pace.js"></script>

<!---------ปฏิทิน--------->
<script src="js/jquery-ui.js"></script>
<!---------ปฏิทิน--------->

<!-- ///////////// -->
<!-- tooltip -->

<script>
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
});
</script>
<!-- tooltip -->






<script>
$(function () {
    $('#startT').datetimepicker({
        use24hours: true
    });
});	
$(function () {
    $('#endT').datetimepicker({
        use24hours: true
    });
});
</script>

