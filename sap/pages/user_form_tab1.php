<?php
$title_page = "ข้อมูลส่วนตัว";
$tbl_policy = "tbworkcenter";
$myfile = "user_form_tab1";

$filed1 = "idwkctr"; // id คีย์หลัก
$filed2 = "titlewkctr";
$filed3 = "namewkctr";
$filed4 = "surnamewkctr";
$filed5 = "titlewkctreng";
$filed6 = "namewkctreng";
$filed7 = "surnamewkctreng";
$filed8 = "startwork";
$filed9 = "iddepartment";
$filed10 = "idposition";
$filed11 = "wkctr";
$filed12 = "plnt";
$filed13 = "cat";
$filed14 = "resp";
$filed15 = "idwkctrgroup";
$filed16 = "idwkctrtype";
$filed17 = "wkctrdate";
$filed18 = "wkctrtel";
$filed19 = "wkctrmail";
$filed20 = "labourcost";
$filed21 = "UserST";
$filed22 = "Password";
$filed23 = "workstatus";

?>

<!-- <div id="app" class=""> -->
<form role="form" method="POST" action="<?php $PHP_SELF ?>?module=<?php echo $myfile;?>"> 

					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info "  style="width: 180px; text-align: right;" >idwkctr</span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="idwkctr" name="idwkctr" value="<?php echo $result['idwkctr'];?>" READONLY>
    				</div>

					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info " style="width: 180px; text-align: right;" >คำนำหน้าชื่อ</span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="titlewkctr" name="titlewkctr" value="<?php echo $result['titlewkctr'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="คำนำหน้าชื่อ">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend">
        					<span class="btn btn-info" style="width: 180px; text-align: right;">ชื่อ</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="namewkctr" name="namewkctr" value="<?php echo $result['namewkctr'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="ชื่อ">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">นามสกุล</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="surnamewkctr" name="surnamewkctr" value="<?php echo $result['surnamewkctr'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="นามสกุล">
    				</div>
					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info " style="width: 180px; text-align: right;" >คำนำหน้าชื่อ eng</span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="titlewkctreng" name="titlewkctreng" value="<?php echo $result['titlewkctreng'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="คำนำหน้าชื่อ eng">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend">
        					<span class="btn btn-info" style="width: 180px; text-align: right;">ชื่อ eng</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="namewkctreng" name="namewkctreng" value="<?php echo $result['namewkctreng'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="ชื่อ eng">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">นามสกุล eng</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="surnamewkctreng" name="surnamewkctreng" value="<?php echo $result['surnamewkctreng'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="นามสกุล eng">
    				</div>




<div class="input-group mb-3">
  <div class="input-group-prepend">
    <span class="btn btn-info" style="width: 180px; text-align: right;">วัน.เดือน.ปีเกิด</span>
  </div>
	<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;height: 42px;">
		<input type="date" class="xDateContainer" onchange="setCorrect(this,'wkctrdate');" style="position: absolute; opacity: 0.0;height: 100%;width: 100%;">
		<!-- <input type="text" id="wkctrdate" name="wkctrdate" value="dd.mm.yyyy" style="border: none;height: 90%;" tabindex="-1"> -->
		<input type="text" id="wkctrdate" name="wkctrdate" value="<?php echo date("d.m.Y", $result['wkctrdate']);?>" style="border: none;height: 90%;" tabindex="-1">
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
        					<span class="btn btn-info" style="width: 180px; text-align: right;">เบอร์โทรศัพท์</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="wkctrtel" name="wkctrtel" value="<?php echo $result['wkctrtel'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="วันเกิด">
    				</div>
					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">อีเมล์</span>
      					</div>
      					<input type="email" class="form-control" placeholder="" id="wkctrmail" name="wkctrmail" value="<?php echo $result['wkctrmail'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="อีเมล์">
    				</div>


				<!-- <div class="form-group">
					<input type="hidden" name="op" value="save">
					<button type="submit" name="Submit" class="btn btn-success float-right"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกข้อมูล&nbsp;</button>
				</div> -->

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
<!-- </div> -->


