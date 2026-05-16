<?php

// Include File connect Database
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
require_once('../include/define.php');
require_once('../include/function.php');

if(!empty($_POST["Event"])){
	$idiw37 = $_POST["Event"][0];
?>

<style>
/* Style the tab */
.tab {
  overflow: hidden;
  border: 0px solid #ccc;
 /* background-color: #f1f1f1; */
}

/* Style the buttons inside the tab */
.tab button {
  /* background-color: #008CBA;   สีปุ่ม */
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
  font-size: 17px;
}

/* Change background color of buttons on hover */
.tab button:hover {
  background-color: #ddd;
}

/* Create an active/current tablink class */
.tab button.active {
  background-color: #ccc;
}

/* Style the tab content */
.tabcontent {
  display: none;
  padding: 6px 12px;
  border: 0px solid #ccc;
  border-top: none;
}
</style>

<script>
	function newPlan(id,start){
		<?PHP 
		//Loop หารหัส reson
		$sqlres = "SELECT * FROM  tbreason   ";
			$quRes = mysqli_query($link, $sqlres) or die ("Error Query [".$sqlres."]");
			$reson = "";
				while($rsRes = mysqli_fetch_array($quRes)){
					$reson .= $rsRes["reasoncode"] ."=". $rsRes["reasonname"]."\\r\\n";
				}
			//Loop หารหัส reson
		?>
		var Events = [];
		var person = prompt("Move To "+ start +"  \r\n<?PHP echo $reson;?> Please enter Reason:", "");		
		if (person == null || person == "") {
			Events[0] = '';
			Events[1] = '';
			Events[2] = '';
		}else{
			Events[0] = id;
			Events[1] = start;
			Events[2] = person;
		}					
					
		//alert('selected ' + Events[0] + Events[1] );
		//Send Ajax On Select Table					
		$.ajax({
			url: 'modalPages/MovePlant.php',
			type: "POST",
			data: {Event:Events },
			 	success: function(rep) {							
				alert(rep);				
				}
			});						
					//Send Ajax On Select Table	
	} //end  function newPlan(id,start){
	
</script>


<?PHP
//Search Database view_confrim
$sql = " SELECT * FROM view_order  where idiw37='$idiw37' ";
$query = mysqli_query($link, $sql) or die ("Error Query [".$sql."]");
$row = mysqli_fetch_array($query);
//Show Date
?>

<!-- Modal Edit -->
		<div class="modal fade" id="ModalOrderDetail" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		  <div class="modal-dialog modal-lg" role="document">
			<div class="modal-content">
			<form class="form-horizontal" method="POST" action="calendar/editEventTitle.php">
			  <div class="modal-header">
			  <div class="input-group mb-3">
      					<button type="buton" class="form-control aling-center alert alert-success" placeholder="operationst" id="operationst" name="operationst" style=" text-align: center;">
						  <?PHP echo $row["operationshorttext"] ?> </button>
    				</div>
          			<button type="button" class="close" data-dismiss="modal">&times;</button>
			  </div>

			  <div class="modal-body">  
<!------------   start Content -------------------->	
<?PHP

if($row["bscstart"]){ //วันที่วางแผน
	$PlanDate = date('d.m.Y', $row["bscstart"]) ;
}

if($row["actfinish"]){ //วันที่ปิดงาน
	$ActionDate = date('d.m.Y', $row["actfinish"]) ;
}
if($row["cday"]){ //วันที่ย้ายแผน
	$ChangeDate = date('d.m.Y', $row["cday"]);
	$Cd = date("d",$row["cday"]) ;
	$Cm  = date("m",$row["cday"]) ;
	$Cy = date("Y",$row["cday"]) ;
}else{
	$Cd = date("d") ;
	$Cm  = date("m") ;
	$Cy = date("Y") ;
}

if($row["mpcount"]){  //จำนวนครั้งที่ทำการย้ายแผน
	$MoveCount =  $row["mpcount"] . ' ครั้ง';
}
//Show Date

//End Search Database view_confrim
?>
<!-- <div class="modal-body"> -->
<div class="container h-100 py-2">
			<ul class="nav nav-tabs border-0" id="myTab" role="tablist">
				<li class="nav-item">
					<a class="nav-link active border border-primary border-bottom-0" id="WorkOrder-tab" data-toggle="tab" href="#WorkOrder" role="tab" aria-controls="WorkOrder" aria-selected="true">Work Order</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-warning border-bottom-0" id="TaskList-tab" data-toggle="tab" href="#TaskList" role="tab" aria-controls="TaskList" aria-selected="false">Task List</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-danger border-bottom-0" id="Machine-tab" data-toggle="tab" href="#Machine" role="tab" aria-controls="Machine" aria-selected="false">Machine List</a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-danger border-bottom-0" id="Planning-tab" data-toggle="tab" href="#Planning" role="tab" aria-controls="Planning" aria-selected="false">Planning</a>
				</li>
				
			</ul>

			<div class="tab-content h-75">
				<div class="tab-pane h-100 p-3 active border border-primary" id="WorkOrder" role="tabpanel" aria-labelledby="WorkOrder-tab">
				<?php
					include("TabWorkOrder.php");
				?>		
				</div>
				<div class="tab-pane h-100 p-3 border border-warning" id="TaskList" role="tabpanel" aria-labelledby="TaskList-tab">
				<?php
					include("TabTarkList.php");
				?>			
				</div>
				<div class="tab-pane h-100 p-3 border border-danger" id="Planning" role="tabpanel" aria-labelledby="Planning-tab">
				<?php
					include("TabPlanning.php");
				?>			
				</div>
				<div class="tab-pane h-100 p-3 border border-danger" id="Machine" role="tabpanel" aria-labelledby="Machine-tab">
				<?php
					include("TabMachine.php");
				?>			
				</div>
			</div>
		</div>
	<!-- </div> -->

		<!------------   End Content -------------------->		
			  </div>

			  <div class="modal-footer">
				<button type="button" class="btn btn-success" data-dismiss="modal">Close</button>
				<!--------- <button type="submit" class="btn btn-primary">Save changes</button>   ------->
			  </div>
			</form>
			</div>
		  </div>
		</div>

    </div>


<?PHP  } // End if(!empty($_POST["Event"]))  /*****  End File */ ?>	