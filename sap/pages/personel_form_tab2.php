<?php
// คำนวนวันทำงาน
//$startwork = '06.06.1976';
//echo 'Born on : '.$birthdate;
//echo "startwork=".date("d.m.Y", $result['startwork']);
if(!empty($result['startwork'])){
    $startwork = date("d.m.Y", $result['startwork']);
}else {
    $startwork = "";
}

//echo '<br>Today your work is : '.Calage($startwork);
?>


					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัส SAP</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="wkctr" name="wkctr" value="<?php echo $result['wkctr'];?>" onkeyup="return myUser(this.value,'pass')" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสพนักงาน">
    				</div>

<div class="input-group mb-3">
  <div class="input-group-prepend">
    <span class="btn btn-info" style="width: 180px; text-align: right;">วัน.เดือน.ปี ที่เริ่มงาน</span>
  </div>
  <input type="text" class="form-control datepic"  id="startwork" name="startwork" value="<?php echo $startwork;?>" data-toggle="tooltip" data-html="true" data-placement="top" title="dd.mm.yyyy"  >						
</div>

<?php
if(!empty($result['startwork'])){
    $startwork = strtotime( date("d.m.Y", $result['startwork']) );
}else{
    $startwork = "";
}

$today = time();

if (!empty($startwork)){
?>
	<div class="input-group mb-3">
		<div class=" input-group-prepend ">
			<span class="btn btn-info "  style="width: 180px; text-align: right;" >อายุการทำงาน </span>
		</div>
		<input type="text" class="form-control " placeholder="" id="Show_work" name="Show_work" value="<?php if(!empty($startwork)){ echo timespan( $startwork , $today );  } ?>" READONLY>
	</div>

<?php
}else{
?>
	<div class="input-group mb-3">
		<div class=" input-group-prepend ">
			<span class="btn btn-info "  style="width: 180px; text-align: right;" >อายุการทำงาน </span>
		</div>
		<input type="text" class="form-control " placeholder="" id="Show_work" name="Show_work" value="" READONLY>
	</div>
<?php
}
?>

						<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัสกลุ่มงาน</span>
						  </div>
						  <?PHP  InSelect('tbwkctrgroup', $filed15,$result[$filed15] , 'wkctrdescription','' );  // InSelect(table, field Value ,value, Show value, required ) ?>	
      					</div>

				<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัสหน่วยงาน</span>
						  </div>
						  <?PHP  InSelect('tbdepartment', $filed9, $result[$filed9] ,'department','required' );  // InSelect(table, field Value ,value, Show value, required ) ?>	
      					</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัสตำแหน่ง</span>
						  </div>
						  <?PHP  InSelect('tbposition', $filed10, $result[$filed10] ,'position','required' );  // InSelect(table, field Value ,value, Show value, required )?>	
					</div>
					
					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">ระดับ</span>
						  </div>
						  <?PHP  InSelect('tbwklevel', $filed17, $result[$filed17] ,'wklevel','' );  // InSelect(table, field Value ,value, Show value, required )?>	
    				</div>


					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รหัสประเภทช่าง</span>
						  </div>
						  <?PHP  InSelect('tbwkctrtype', $filed16, $result[$filed16] , 'wkctrtype','required' );  // InSelect(table, field Value ,value, Show value, required ) ?>						  
    				</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">ต้นทุนต่อคน</span>
      					</div>
      					<input type="text" class="form-control" placeholder="" id="labourcost" name="labourcost" value="<?php echo $result['labourcost'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="ต้นทุนต่อคน">
    				</div>

					<div class="input-group mb-3">
      					<div class="input-group-prepend">
        					<span class="btn btn-info" style="width: 180px; text-align: right;">สถานะระบบ</span>
      					</div>
						  <?PHP  InSelect('tbuserst', $filed22, $result[$filed22] , 'userstdesc','required' );  // InSelect(table, field Value ,value, Show value, required )?>				
    				</div>	

                    <div class="input-group mb-3">
      					<div class="input-group-prepend" >
        					<span class="btn btn-info" style="width: 180px; text-align: right;">รูปประจำตัว</span>
      					</div>
                        <div class="input-group-prepend custom-file">
                            <input type="file" class="custom-file-input" id="fileUpload" name="fileUpload" value="<?php echo $result['imgmember'];?>">
                            <label class="custom-file-label" for="customFile">Choose file</label>
                        </div>
                    </div>

<script>
// Add the following code if you want the name of the file appear on select
$(".custom-file-input").on("change", function() {
  var fileName = $(this).val().split("\\").pop();
  $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});
</script>