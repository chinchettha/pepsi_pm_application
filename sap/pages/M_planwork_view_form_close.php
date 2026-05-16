<?
$tb1 = "view_order";


$id =  $_REQUEST["id"]; //รับค่อ Ajax แบบ Post



$SqlTB1 = " SELECT * FROM  $tb1 where  idiw37= '$id'  ";
$qrTB1 = mysqli_query($link, $SqlTB1) or die ("Error Query [".$SqlTB1."]");
$totalTB1 = mysqli_num_rows($qrTB1);

if($totalTB1 >0){
	$rsTB1 = mysqli_fetch_array($qrTB1);
	$idiw37 = $rsTB1["idiw37"];
?>
<!----- Show Order Detail --------->


<p></p>
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
			</ul>

			<div class="tab-content h-75">
				<div class="tab-pane h-100 p-3 active border border-primary" id="WorkOrder" role="tabpanel" aria-labelledby="WorkOrder-tab">
				<?php
					include_once("modalPages/plan_confirmTab1_close.php");
					?>		
				</div>
				<div class="tab-pane h-100 p-3 border border-warning" id="TaskList" role="tabpanel" aria-labelledby="TaskList-tab">
				<?php
					include_once("modalPages/plan_confirmTab2_close.php");
				?>			
				</div>
				
				<div class="tab-pane h-100 p-3 border border-danger" id="Machine" role="tabpanel" aria-labelledby="Planning-tab">
				<?php
					include_once("modalPages/plan_confirmTab3_close.php");
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



   
<!-- ///////////// -->
<!-- tooltip -->

<script>
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
});
</script>
<!-- tooltip -->

<!--------------  ปฏิทิน  ----------------->
<script language="javascript">
	var matchEnterdDate=0;
	//function to set back date opacity for non supported browsers
		window.onload =function(){
			var input = document.createElement('input');
			input.setAttribute('type','date');
			input.setAttribute('value', 'some text'); 
			if(input.value === "some text"){
				allDates = document.getElementsByClassName("xDateContainer");
				matchEnterdDate=1;
				for (var i = 0; i < allDates.length; i++) {
					allDates[i].style.opacity = "1";
				} 
			}
		}
	//function to convert enterd date to any format
	function setCorrect(xObj,xTraget){
		var date = new Date(xObj.value);
		var month = date.getMonth()+1;
		var day = date.getDate();
		var year = date.getFullYear();
		if(month!='NaN'){
			document.getElementById(xTraget).value=day+"."+month+"."+year;
		}else{
			if(matchEnterdDate==1){document.getElementById(xTraget).value=xObj.value;}
		}
	}
   
	   </script>
<!--------------  ปฏิทิน  ----------------->

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

