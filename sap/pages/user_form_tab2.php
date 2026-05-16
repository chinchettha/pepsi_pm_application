<?php
// คำนวนวันทำงาน
//$startwork = '06.06.1976';
//echo 'Born on : '.$birthdate;
//echo "startwork=".date("d.m.Y", $result['startwork']);
$startwork = date("d.m.Y", $result['startwork']);
//echo '<br>Today your work is : '.Calage($startwork);
?>

<form role="form" method="POST" action="<?php $PHP_SELF ?>?module=<?php echo $myfile;?>"> 

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัสพนักงาน</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="wkctr" name="wkctr" value="<?php echo $result['wkctr'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสพนักงาน">
    				</div>

					<!-- <div class="input-group mb-3">
						<div class="input-group-prepend" >
							<span class="btn btn-info" style="width: 180px; text-align: right;">วันที่เริ่มงาน</span>
						</div>
						<input type="text" class="form-control" placeholder="" name="startwork"  data-toggle="tooltip" data-html="true" data-placement="top" title="วันที่เริ่มงาน" id="" width="50%" value="<?php echo date("d.m.Y", $result['startwork']);?>">
						<?php //echo 'อายุการทำงาน : '.Calage($startwork);?>
					</div> -->


<div class="input-group mb-3">
  <div class="input-group-prepend">
    <span class="btn btn-info" style="width: 180px; text-align: right;">วัน.เดือน.ปี ที่เริ่มงาน</span>
  </div>
	<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;height: 42px;">
		<input type="date" class="xDateContainer" onchange="setCorrect(this,'startwork');" style="position: absolute; opacity: 0.0;height: 100%;width: 100%;">
		<!-- <input type="text" id="startwork" name="startwork" value="dd.mm.yyyy" style="border: none;height: 90%;" tabindex="-1"> -->
		<input type="text" id="startwork" name="startwork" value="<?php echo date("d.m.Y", $result['startwork']);?>" style="border: none;height: 90%;" tabindex="-1">
		<span style="display: inline-block;width: 20px;z-index: 2;float: right;padding-top: 3px;" tabindex="-1">&#9660;</span>
	</span>
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
</div>


						<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัสกลุ่มงาน</span>
      					</div>
      					<!-- <input type="text" class="form-control" placeholder="" id="idwkctrgroup" name="idwkctrgroup" value="<?php echo $result['idwkctrgroup'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสกลุ่มงาน"> -->
						<select name="idwkctrgroup" id="idwkctrgroup" class="" style="height:40px;" required>
							<option value="<?php echo $result['idwkctrgroup'];?>" selected><?php echo $result['wkctrgroup']."/".$result['wkctrdescription'];?></option>
							<?php
							$strSQL = "SELECT * FROM tbwkctrgroup 
							WHERE tbwkctrgroup.idwkctrgroup NOT LIKE '".$result['idwkctrgroup']."'" ;
							$objQuery = mysqli_query($link,$strSQL);
							while($objResuut = mysqli_fetch_array($objQuery))
							{?>
							<option value="<?php echo $objResuut['idwkctrgroup'];?>"><?php echo $objResuut['wkctrgroup']."/".$objResuut['wkctrdescription'];?></option>
							<?php }?>
						</select>

    				</div>

				<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัสหน่วยงาน</span>
      					</div>
      					<!-- <input type="text" class="form-control" placeholder="" id="iddepartment" name="iddepartment" value="<?php echo $result['iddepartment'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสหน่วยงาน"> -->
						<select name="iddepartment" id="iddepartment" class="" style="height:40px;" required>
							<option value="<?php echo $result['iddepartment'];?>" selected><?php echo $result['department'];?></option>
							<?php
							$strSQL = "SELECT * FROM tbdepartment 
							WHERE tbdepartment.iddepartment NOT LIKE '".$result['iddepartment']."'" ;
							$objQuery = mysqli_query($link,$strSQL);
							while($objResuut = mysqli_fetch_array($objQuery))
							{?>
							<option value="<?php echo $objResuut['iddepartment'];?>"><?php echo $objResuut['department'];?></option>
							<?php }?>
						</select>

    				</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัสตำแหน่ง</span>
      					</div>
      					<!-- <input type="text" class="form-control" placeholder="" id="idposition" name="idposition" value="<?php echo $result['idposition'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสตำแหน่ง"> -->
						<select name="idposition" id="idposition" class="" style="height:40px;" required>
							<option value="<?php echo $result['idposition'];?>" selected><?php echo $result['position'];?></option>
							<?php
							$strSQL = "SELECT * FROM tbposition 
							WHERE tbposition.idposition NOT LIKE '".$result['idposition']."' " ;
							$objQuery = mysqli_query($link,$strSQL);
							while($objResuut = mysqli_fetch_array($objQuery))
							{?>
							<option value="<?php echo $objResuut['idposition'];?>"><?php echo $objResuut['position'];?></option>
							<?php }?>
						</select>

    				</div>


					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัสประเภทช่าง</span>
      					</div>
      					<!-- <input type="text" class="form-control" placeholder="" id="idwkctrtype" name="idwkctrtype" value="<?php echo $result['idwkctrtype'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสประเภทช่าง"> -->
						<select name="idwkctrtype" id="idwkctrtype" class="" style="height:40px;" required>
							<option value="<?php echo $result['idwkctrtype'];?>" selected><?php echo $result['wkctrtype'];?></option>
							<?php
							$strSQL = "SELECT * FROM tbwkctrtype 
							WHERE tbwkctrtype.idwkctrtype NOT LIKE '".$result['idwkctrtype']."'" ;
							$objQuery = mysqli_query($link,$strSQL);
							while($objResuut = mysqli_fetch_array($objQuery))
							{?>
							<option value="<?php echo $objResuut['idwkctrtype'];?>"><?php echo $objResuut['wkctrtype'];?></option>
							<?php }?>
						</select>
    				</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">ต้นทุนต่อคน</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="labourcost" name="labourcost" value="<?php echo $result['labourcost'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="ต้นทุนต่อคน">
    				</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend">
        					<span class="btn btn-info" style="width: 180px; text-align: right;">สถานะการใช้งาน</span>
      					</div>
						<select name="UserST" id="UserST" class="" style="height:40px;" required>
							<option value="<?php echo $result['UserST'];?>" selected><?php echo $result['userstdesc'];?></option>
							<?php
							$strSQL = "SELECT * FROM tbuserst 
							WHERE tbuserst.userst NOT LIKE '".$result['UserST']."'" ;
							$objQuery = mysqli_query($link,$strSQL);
							while($objResuut = mysqli_fetch_array($objQuery))
							{?>
							<option value="<?php echo $objResuut['userst'];?>"><?php echo $objResuut['userstdesc'];?></option>
							<?php }?>
						</select>
    				</div>	

	<div class="modal-footer">
		<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
		<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
		<input type="hidden" name="module" value="<?php echo $myfile; ?>">
		<button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times nav-icon"></i>&nbsp;ยกเลิก&nbsp;</button>
		<?php if ($_REQUEST['op']=="edit"){
			echo "<input type='hidden' name='op' value='save'>";
			echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;แก้ไขข้อมูล&nbsp;</button>";
		}elseif ($_REQUEST['op']=="del"){
			echo "<input type='hidden' name='op' value='del'>";
			echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-warning btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;ลบข้อมูล&nbsp;</button>";
		}else{
			echo "<input type='hidden' name='op' value='save'>";
			echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;เพิ่มข้อมูล&nbsp;</button>";
		}
		?>
	</div>
</form>
