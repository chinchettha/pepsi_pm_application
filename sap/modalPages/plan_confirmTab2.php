
<link rel="stylesheet" href="js/jquery-ui.css">
<!------------ กำหนดรูปแบบการป้อนข้อความ -------------->
<script type="text/javascript">
function autoTab(obj,typeCheck){
    /* กำหนดรูปแบบข้อความโดยให้ _ แทนค่าอะไรก็ได้ แล้วตามด้วยเครื่องหมาย
    หรือสัญลักษณ์ที่ใช้แบ่ง เช่นกำหนดเป็น  รูปแบบเลขที่บัตรประชาชน
    4-2215-54125-6-12 ก็สามารถกำหนดเป็น  _-____-_____-_-__
    รูปแบบเบอร์โทรศัพท์ 08-4521-6521 กำหนดเป็น __-____-____
    หรือกำหนดเวลาเช่น 12:45:30 กำหนดเป็น __:__:__
    ตัวอย่างข้างล่างเป็นการกำหนดรูปแบบเลขบัตรประชาชน
    */
        if(typeCheck==1){
            var pattern=new String("__.__.____"); // กำหนดรูปแบบในนี้
            var pattern_ex=new String("."); // กำหนดสัญลักษณ์หรือเครื่องหมายที่ใช้แบ่งในนี้                 
        }else{
            var pattern=new String("__:__"); // กำหนดรูปแบบในนี้
            var pattern_ex=new String(":"); // กำหนดสัญลักษณ์หรือเครื่องหมายที่ใช้แบ่งในนี้    
        }
        var returnText=new String("");
        var obj_l=obj.value.length;
        var obj_l2=obj_l-1;
        for(i=0;i<pattern.length;i++){           
            if(obj_l2==i && pattern.charAt(i+1)==pattern_ex){
                returnText+=obj.value+pattern_ex;
                obj.value=returnText;
            }
        }
        if(obj_l>=pattern.length){
            obj.value=obj.value.substr(0,pattern.length);           
        }
}
</script>
<!------------ กำหนดรูปแบบการป้อนข้อความ -------------->


<div class="card-body">
<div class="">

	
<!--------  ฟอร์ม Close confrim ----------->
<?PHP
	if(trim($rsTB1["syst"]) == "CRTD" || trim($rsTB1["syst"]) == "REL"  ){
?>

	<div class="input-group mb-3">
    	<div class="input-group-prepend">
      		<button class="btn btn-outline-primary" type="button">เวลาเริ่ม :  </button>  
		</div>
		<div class="input-group-prepend">
			<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;">
			<input type="text" id="startD" name="startD" value="<?php echo date('d.m.Y');?>" style="border: none;"  required title="dd.mm.YYYY" onkeyup="autoTab(this,1)" >
			
		</div>
		<input type="text" id="startT" name="startT" class="form-control" placeholder="00:00" data-toggle="tooltip"  data-placement="top" title="24 Hour"  required onkeyup="autoTab(this,2)" >
		<div class="input-group-prepend">
      		<button class="btn btn-outline-primary" type="button">เวลาเสร็จ :  </button>  
    	</div>	
		<div class="input-group-prepend">
			<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;">			
			<input type="text" id="endD" name="startD" value="<?php echo date('d.m.Y');?>" style="border: none;"  required data-toggle="tooltip"  data-placement="top" title="dd.mm.YYYY" onkeyup="autoTab(this,1)" >
			
		</div>
		<input type="text" id="endT" name="endT" class="form-control" placeholder="00:00" data-toggle="tooltip"  data-placement="top" title="24 Hour"  required onkeyup="autoTab(this,2)" >
	</div>


<div class="container-fluid">
<div class="row">
<div class="btn-group btn-group-justified col-sm-12">
    <button class="btn btn-primary" onclick="return AddClose('<?PHP echo  $rsTB1['idiw37']?>','<?php echo $_SESSION['wkctr'];?>',startD.value,startT.value,endD.value,endT.value,'Add') "><i class="fa fa-edit"></i>  Close Work Order</button>
</div>
  </div>
</div>  


<?PHP  
		} // end if(trim($rsTB1["syst"]) == "CRTD" || trim($rsTB1["syst"]) == "REL"  ){
?>
<!-------- ปิด ฟอร์ม Close confrim ----------->

</div>
</div>
<p></p>


<!------------  Show Personel Close ------------->
<div class="alert alert-info" > ข้อมูลการปิดงาน </div>
<div id="PersonelClose" > <?PHP  include_once("plan_ShowClose.php"); ?> </div>

<!------------ Close Show Personel Close ------------->

<!---------  ปฏิทิน ------------->
<script>
        $(function() {
            $("#startD").datepicker({
                changeMonth: true,
                changeYear: true,  
				showButtonPanel: true,			
                dateFormat: 'dd.mm.yy'
            });
        });
</script>

<script>
        $(function() {
            $("#endD").datepicker({
                changeMonth: true,
                changeYear: true,  
				showButtonPanel: true,
                dateFormat: 'dd.mm.yy'
            });
        });
</script>
<!---------  ปฏิทิน ------------->


<script>
function AddClose(idiw37,wkctr,startD,startT,endD,endT,st){  // AddClose(idiw37,wkctr,startD,startT,endD,endT,st=Add or Del)
	var Events = [];
	Events[0] = idiw37;
	Events[1] = wkctr;
	Events[2] = startD;
	Events[3] = startT;
	Events[4] = endD;
	Events[5] = endT;
	Events[6] = st;
if(Events[3] == "" || Events[5] == "" ){ //เช็คกรอกข้อมูล
	swal('กรุณาระบุเวลาการทำงาน \n ด้วยครับ!', 'โปรดตรวจสอบ!', 'warning');
	//alert ("กรุณากรอกเวลาการทำงาน ด้วยครับ");
	return false ;
}else {
//Send Ajax On Select Table
$.ajax({
	url: 'modalPages/AddClosePersonel.php',
	type: "POST",
	data: {Event:Events },
	success: function(rep) {
		$("#PersonelClose").html(rep); //	Show in <Div>										
	}
});		
//Send Ajax On Select Table	

} //เช็คกรอกข้อมูล

} //end function
</script>