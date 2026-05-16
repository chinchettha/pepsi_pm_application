<?PHP
		$sqlPL = "SELECT * FROM view_workcenter  order by wkctr ASC   ";
		$queryPL = mysqli_query($link, $sqlPL) or die ("Error Query [".$sqlPL."]");
?>
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

	

	<div class="input-group mb-3">
    	<div class="input-group-prepend">
      		<button class="btn btn-outline-primary" type="button">เวลาเริ่ม :  </button>  
		</div>
		<div class="input-group-prepend">
			<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;">
			<input type="text" id="startD" name="startD" value="<?php echo date('d.m.Y');?>" style="border: none;height: 90%;" tabindex="1" required  required onkeyup="autoTab(this,1)" >			
		</div>
		<input type="text" id="startT" name="startT" class="form-control" placeholder="00:00" tabindex="2" data-toggle="tooltip"  data-placement="top" title="24 Hour"  required onkeyup="autoTab(this,2)" >
		<div class="input-group-prepend">
      		<button class="btn btn-outline-primary" type="button">เวลาเสร็จ :  </button>  
    	</div>	
		<div class="input-group-prepend">
			<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;">
			<input type="text" id="endD" name="endD" value="<?php echo date('d.m.Y');?>" style="border: none;height: 90%;" tabindex="3"  required onkeyup="autoTab(this,1)"  >
			
		</div>
		<input type="text" id="endT" name="endT" class="form-control" placeholder="00:00" tabindex="4" data-toggle="tooltip"  data-placement="top" title="24 Hour"  required onkeyup="autoTab(this,2)"  >
	  </div>

</div>

<div class="row">
<?php								
	while($rsPL = mysqli_fetch_array($queryPL)){											
	?>
    <div> 
    <p>  &nbsp;
    <button type="button"  onclick="return AddClose('<?PHP echo  $rsTB1['idiw37']?>','<?php echo $rsPL['wkctr'];?>',startD.value,startT.value,endD.value,endT.value,'Add','#AddClose') "  class="btn btn-info" >
    <?php echo $rsPL['wkctr'];?> <br>
    <?php echo $rsPL['titlewkctr'].$rsPL['namewkctr']." ".$rsPL['surnamewkctr'];?>
    </button>
    &nbsp; </p>
    </div> 

    <?PHP  } ?>

</div>

<!--------  ปิดแบบตารางไว้ก่อน ----------------
    <div class="table-responsive">
		 <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='5'>
                                        <thead class="thead-dark">
                                            <tr>
												<th>รหัสช่าง</th>
                                                <th>ชื่อ-สกุล</th>
                                                <th>กลุ่มงาน</th>
                                                <th>ตำแหน่ง</th>                                               
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                       
                                        <tbody>
										<?php								
										while($rsPL = mysqli_fetch_array($queryPL))
										{											
										?>
                                            <tr>
										        <td><?php echo $rsPL['wkctr'];?></td>
                                                <td><span data-toggle="tooltip"  title="<?php echo $rsPL['titlewkctreng'].$rsPL['namewkctreng']." ".$rsPL['surnamewkctreng'];?>"><?php echo $rsPL['titlewkctr'].$rsPL['namewkctr']." ".$rsPL['surnamewkctr'];?></span></td>
                                                <td><?php echo $rsPL['wkctrtype'];?></td>
                                                <td><?php echo $rsPL['position'];?></td>                                              
                                                <td align="center">
													
												
												</td>
                                            </tr>
										<?php } ?>

                                        </tbody>
									</table>
	</div>
--- ปิดแบบตารางไว้ก่อน-------------->
</div>			

<!------------  Show Personel Close ------------->
<div class="alert alert-warning" > ข้อมูลการปิดงาน จากช่าง... </div>
<div id="PersonelClose" ><?PHP include_once("ShowWorkClose.php");?></div>
<!------------ Close Show Personel Close ------------->

<!------------  Show tbplaningwork ------------->
<div class="alert alert-success" >Confirm ผู้ปฏิบัติงาน... </div>
<div id="AddClose" ><?PHP include_once("ShowClose.php");?></div>
<!------------ Close Show tbplaningwork ------------->


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
function AddClose(idiw37,wkctr,startD,startT,endD,endT,st,dv){  // AddClose(idiw37,wkctr,startD,startT,endD,endT,st=Add or Del,div)
	var Events = [];
	Events[0] = idiw37;
	Events[1] = wkctr;
	Events[2] = startD;
	Events[3] = startT;
	Events[4] = endD;
	Events[5] = endT;
	Events[6] = st;
if(Events[3] == "" || Events[5] == "" ){ //เช็คกรอกข้อมูล
	alert ("กรุณากรอกเวลาการทำงาน ด้วยครับ");
	return false ;
}else {
//Send Ajax On Select Table
$.ajax({
	url: 'modalPages/AddClose.php',
	type: "POST",
	data: {Event:Events },
	success: function(rep) {
		$(dv).html(rep); //	Show in <Div>
		//$("#ModalOrderDetail").modal('show'); //Open Modal										
	}
});		
//Send Ajax On Select Table	

} //เช็คกรอกข้อมูล

} //end function
</script>