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
<p class="text-center">

<div class="input-group mb-3 "  >
    	<div class="input-group-prepend">
      		<button class="btn btn-info" type="button"   >เริ่มวันที่  :  </button>  
              <input type="text" id="startD" name="startD" value="" style="height:45px ;"    title="dd.mm.YYYY"  > 
		</div>

	
		<div class="input-group-prepend">
      		<button class="btn btn-info" type="button"> ถึงวันทืี่ :  </button>  
              <input type="text" id="endD" name="endD" value="" style="height: 45px;"   title="dd.mm.YYYY" > 
    	</div>	
		
		<button class="btn btn-success" type="button" onclick="ShowChart(startD.value,endD.value)" > Search </button> 
	</div>

  <div id="showChart">
    <?PHP  include_once("M_manhour_chart_performance.php");?>
  </div>
 

</p>
</div>

<!-------  Send Ajax -------->
<script>
function ShowChart(stdate,endate){  // AddClose(idiw37,wkctr,startD,startT,endD,endT,st=Add or Del)
	var Events = [];
	Events[0] = stdate;
	Events[1] = endate;

//Send Ajax On Select Table
$.ajax({
	url: 'pages/M_manhour_chart_performance.php',
	type: "POST",
	data: {Event:Events },
	success: function(rep) {
		$("#showChart").html(rep); //	Show in <Div>										
	}
});		
//Send Ajax On Select Table	

} //end function
</script>
<!------- End Send Ajax -------->



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