
<div class="chart tab-pane active" id="sales-task"
   style="position: relative; height: auto;">


<!-- Main content -->
<section class="content">

	<!-- Default box -->
	<!-- <div class="container-fluid"> -->
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">ยืนยันบันทึกการปิดงาน <?php echo $_REQUEST['wkorder'];?></h4>
        </div>
        <div class="card-body">

		<form name="frmMain" id="frmMain" method="POST" action="<?php $PHP_SELF ?>?module=W_confirm_form&idplanw=<?php echo $_SESSION['idplanw'];?>&idiw37=<?php echo $_SESSION['idiw37'];?>&wkorder=<?php echo $_SESSION['wkorder'];?>" enctype="multipart/form-data" onsubmit="return chk();">
		<input type="hidden" name="op" value="save_close">

			<div class="row">
			  <!-- left column -->
			  <div class="col-md-6">

				<div class="input-group mb-3">
					<div class="input-group-prepend" >
						<span class="btn btn-info" style="width: 180px; text-align: right;">วัน/เวลา ที่เริ่มงาน</span>
					</div>
					  <?PHP  
						$startT = date("d.m.Y", mktime(0, 0, 0, date("d"), date("m"), date("Y")));
						
						/*if($result["cstdate"]){
							$birthday = mktime(0, 0, 0, date("d"), date("m"), date("Y"));
						 } else{
							 $birthday = "";
						 }// end if($result["cstdate"]){
						*/
					  ?>
						<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;height: 42px;">
						<input type="date" class="xDateContainer" onchange="setCorrect(this,'cstdate');" style="position: absolute; opacity: 0.0;height: 100%;width: 100%;" data-toggle="tooltip" data-html="true" data-placement="top" title="วันที่เริ่ม" >
						<input type="text" id="cstdate" name="cstdate" value="<?php echo $startT;?>" style="border: none;height: 90%;" tabindex="-1"  >
						<span style="display: inline-block;width: 20px;z-index: 2;float: right;padding-top: 3px;" tabindex="-1">&#9660;</span>
						</span>
						<!-- <input type="time" id="startT" name="startT" class="" placeholder="Enter Hour" data-toggle="tooltip"  data-placement="top" title="24 Hour" style="height:42px;width:200px;" required> -->
				</div>

			  </div>
			  <div class="col-md-6">
				<div class="input-group mb-3">
					<div class="input-group-prepend" >
						<span class="btn btn-info" style="width: 180px; text-align: right;">เวลาเริ่มงาน</span>
					</div>
						<input type="time" id="startT" name="startT" class="" placeholder="Enter Hour" data-toggle="tooltip"  data-placement="top" title="24 Hour" style="height:42px;width:50%;" required>
				</div>
			  </div>

			  <div class="col-md-6">
				<div class="input-group mb-3">
				  <div class="input-group-prepend">
					<span class="btn btn-info" style="width: 180px; text-align: right;">วัน/เวลา เสร็จงาน</span>
				  </div>
					<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;">
						<input type="date" class="xDateContainer" onchange="setCorrect(this,'cendate');" style="position: absolute; opacity: 0.0;height: 100%;width: 100%;" data-toggle="tooltip" data-html="true" data-placement="top" title="วันที่เสร็จงาน">
						<input type="text"  id="cendate" name="cendate" value="<?php echo date("d.m.Y", mktime(0, 0, 0, date("d"), date("m"), date("Y")));?>" style="border: none;height: 90%;" tabindex="-1">
						<span style="display: inline-block;width: 20px;z-index: 2;float: right;padding-top: 3px;" tabindex="-1">&#9660;</span>
					</span>
				</div>

			  </div>

			  <div class="col-md-6">
				<div class="input-group mb-3">
				  <div class="input-group-prepend">
					<span class="btn btn-info" style="width: 180px; text-align: right;">เวลาเสร็จสิ้น</span>
				  </div>
					<input type="time" id="endT" name="endT" class="" placeholder="Enter Work Order" data-toggle="tooltip"  data-placement="top" title="24 Hour" style="height:42px;width:50%;" required>
				</div>

			  </div>


			  <div class="col-md-6">
				<div class="input-group mb-3">
				  <div class="input-group-prepend">
					<span class="btn btn-info" style="width: 180px; text-align: right;">วันเวลาที่ทำการปิดงาน</span>
				  </div>
					<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;">
						<input type="date" class="xDateContainer" onchange="setCorrect(this,'wktimeclose');" style="position: absolute; opacity: 0.0;height: 100%;width: 100%;" data-toggle="tooltip" data-html="true" data-placement="top" title="วันที่เสร็จงาน">
						<input type="text"  id="wktimeclose" name="wktimeclose" value="<?php echo date("d.m.Y", mktime(0, 0, 0, date("d"), date("m"), date("Y")));?>" style="border: none;height: 90%;" tabindex="-1">
						<span style="display: inline-block;width: 20px;z-index: 2;float: right;padding-top: 3px;" tabindex="-1">&#9660;</span>
					</span>
				</div>

			  </div>

			  <div class="col-md-6">
				<div class="input-group mb-3">
				  <div class="input-group-prepend">
					<span class="btn btn-info" style="width: 180px; text-align: right;">เวลาที่ใช้</span>
				  </div>
					<input type="time" id="wktimewk" name="wktimewk" class="" placeholder="Enter Work Order" data-toggle="tooltip"  data-placement="top" title="24 Hour" style="height:42px;width:50%;" required>
				</div>

			  </div>

			</div><!-- <div class="row"> -->


        </div><!-- /.card-body -->


        
        <div class="card-footer">
<?php
	$strSQL_chk = " SELECT * FROM tbwrkclose where idiw37 ='".$_SESSION['idiw37']."' AND wkctr='".$_SESSION['wkctr']."'; ";
	$query_chk = mysqli_query($link, $strSQL_chk);
	//$result = mysqli_fetch_array($query_chk);
	$numrow_chk = mysqli_num_rows($query_chk);
	if ($numrow_chk==0){ 
?>
		  <button type="submit" class="btn btn-success btn-lg"><i class="fa fa-save"></i>&nbsp;ยืนยันบันทึกการปิดงาน</button>
		  <!-- <button type="reset" class="btn btn-default float-right">ยกเลิก</button> -->
<?php }else{?>
		  <button type="reset" class="btn btn-warning btn-lg"><i class="fa fa-info"></i>&nbsp;Work Order นี้ยืนยันปิดแล้ว</button>
<?php }?>

        </div>
        <!-- /.card-footer-->
      </div>
      <!-- /.card -->

	<!-- </div> -->
</section>


</div>


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
