<?PHP  
$numLM = 2500; //จำกัดจำนวนรายการที่แสดง
$d=cal_days_in_month(CAL_GREGORIAN,date(m),date(Y)); // หาจำนวนวันของเดือนนั้น
$startDayShow  = mktime(0,0,0,date(m),1,date(Y)) ;  // วันที่เริ่มแสดงข้อมูล
$endDayShow = mktime(0,0,0,date(m),$d,date(Y)) ;  ; // วันที่สิ้นสุดการแสดงข้อมูล

//search Data Table TBiw37n
//************ หาค่า Search **************** */
if(!empty($_POST["TxtActivity"])){
	$countArr1 =  count($_POST["TxtActivity"]);
    foreach($_POST["TxtActivity"] AS $i1 => $item1){
        if($i1 == $countArr1-1 ){
            $or1 = " ";
        }else{
            $or1 = ", ";
        }
        $ret1[] = "'". $item1."' ";
        //echo $ret[$i];
        $sqlStatus1 .= $ret1[$i1];
        $sqlStatus1 .= $or1;
        //ทำค่าส่งไปยัง Ajax
        $AjaxRet1[] = "\'".$item1 ."\' ";
        $AjaxSql1 .= $AjaxRet1[$i1];
        $AjaxSql1 .= $or1;
        //ทำค่าส่งไปยัง Ajax
    }
    $TxtActivity = " and  mat in ( ";
    $TxtActivity .=  $sqlStatus1 ;
    $TxtActivity .= " ) ";
   // echo $TxtActivity; 
   //ทำค่าส่งไปยัง Ajax
$Ajax1 = " and  mat in ( ";
$Ajax1 .= $AjaxSql1;
$Ajax1 .= " ) ";
//ทำค่าส่งไปยัง Ajax 
}else {
    $TxtActivity = "";
    $Ajax1 = "";
} // end

if(!empty($_POST["TxtType"])){
	$countArr2 =  count($_POST["TxtType"]);
    foreach($_POST["TxtType"] AS $i2 => $item2){
        if($i2 == $countArr2-1 ){
            $or2 = " ";
        }else{
            $or2 = ", ";
        }
        $ret2[] = "'".$item2 ."' ";
        //echo $ret[$i];
        $sqlStatus2 .= $ret2[$i2];
        $sqlStatus2 .= $or2;
        //ทำค่าส่งไปยัง Ajax
        $AjaxRet2[] = "\'".$item2 ."\' ";
        $AjaxSql2 .= $AjaxRet2[$i2];
        $AjaxSql2 .= $or2;
        //ทำค่าส่งไปยัง Ajax
    }
    $TxtType = " and  wktype in ( ";
    $TxtType .= $sqlStatus2;
    $TxtType .= " ) ";
   // echo $TxtType; 
   //ทำค่าส่งไปยัง Ajax
$Ajax2 = " and  wktype in ( ";
$Ajax2 .= $AjaxSql2;
$Ajax2 .= " ) ";
//ทำค่าส่งไปยัง Ajax 
}else {
    $TxtType = "";
    $Ajax2 = "";
} // end

if(!empty($_POST["TxtProduct"])){
	$countArr3 =  count($_POST["TxtProduct"]);
    foreach($_POST["TxtProduct"] AS $i3 => $item3){
        if($i3 == $countArr3-1 ){
            $or3 = " ";
        }else{
            $or3 = ", ";
        }
        $ret3[] = "'".$item3 ."' ";
        //echo $ret[$i];
        $sqlStatus3 .= $ret3[$i3];
        $sqlStatus3 .= $or3;
        //ทำค่าส่งไปยัง Ajax
        $AjaxRet3[] = "\'".$item3 ."\' ";
        $AjaxSql3 .= $AjaxRet3[$i3];
        $AjaxSql3 .= $or3;
        //ทำค่าส่งไปยัง Ajax
    }
    $TxtProduct = " and  functionalloc in ( ";
    $TxtProduct .= $sqlStatus3;
    $TxtProduct .= " ) ";
   // echo $TxtProduct;  
   //ทำค่าส่งไปยัง Ajax
$Ajax3 = " and  functionalloc in ( ";
$Ajax3 .= $AjaxSql3;
$Ajax3 .= " ) ";
//ทำค่าส่งไปยัง Ajax  
}else {
    $TxtProduct = "";
    $Ajax3 = "";
} // end

if(!empty($_POST["TxtEquipment"])){
	$countArr4 =  count($_POST["TxtEquipment"]);
    foreach($_POST["TxtEquipment"] AS $i4 => $item4){
        if($i4 == $countArr4-1 ){
            $or4 = " ";
        }else{
            $or4 = ", ";
        }
        $ret4[] = "'".$item4 ."' ";
        //echo $ret[$i];
        $sqlStatus4 .= $ret4[$i4];
        $sqlStatus4 .= $or4;

        //ทำค่าส่งไปยัง Ajax
        $AjaxRet4[] = "\'".$item4 ."\' ";
        $AjaxSql4 .= $AjaxRet4[$i4];
        $AjaxSql4 .= $or4;
        //ทำค่าส่งไปยัง Ajax
    }
    $TxtEquipment = " and  equipment in ( ";
    $TxtEquipment .= $sqlStatus4;
    $TxtEquipment .= " ) ";
   // echo $TxtEquipment;   
   //ทำค่าส่งไปยัง Ajax
$Ajax4 = " and  equipment in ( ";
$Ajax4 .= $AjaxSql4;
$Ajax4 .= " ) ";
//ทำค่าส่งไปยัง Ajax   
}else {
    $TxtEquipment = "";
    $Ajax4 = "";
} // end

if(!empty($_POST["TxtStatus"])){
    $countArr5 =  count($_POST["TxtStatus"]);
    foreach($_POST["TxtStatus"] AS $i5 => $item5){
        if($i5 == $countArr5-1 ){
            $or5 = " ";
        }else{
            $or5 = ", ";
        }
        $ret5[] = "'".$item5 ."' ";
        //echo $ret[$i];
        $sqlStatus5 .= $ret5[$i5];
        $sqlStatus5 .= $or5;

        //ทำค่าส่งไปยัง Ajax
        $AjaxRet5[] = "\'".$item5 ."\' ";
        $AjaxSql5 .= $AjaxRet5[$i5];
        $AjaxSql5 .= $or5;
        //ทำค่าส่งไปยัง Ajax
    }
    $TxtStatus = " and  syst in ( ";
    $TxtStatus .= $sqlStatus5;
    $TxtStatus .= " ) ";
    //echo $TxtStatus;

    //ทำค่าส่งไปยัง Ajax
$Ajax5 = " and  syst in ( ";
$Ajax5 .= $AjaxSql5;
$Ajax5 .= " ) ";
//ทำค่าส่งไปยัง Ajax
}else {
    $TxtStatus = "";
    $Ajax5 = "";
} // end

if(!empty($_POST["TxtWkctr"])){
    $countArr6 =  count($_POST["TxtWkctr"]);
    foreach($_POST["TxtWkctr"] AS $i6 => $item6){
        if($i6 == $countArr6-1 ){
            $or6 = " ";
        }else{
            $or6 = ", ";
        }
        $ret6[] = "'".$item6 ."' ";
        //echo $ret[$i];
        $sqlStatus6 .= $ret6[$i6];
        $sqlStatus6 .= $or6;

        //ทำค่าส่งไปยัง Ajax
        $AjaxRet6[] = "\'".$item6 ."\' ";
        $AjaxSql6 .= $AjaxRet6[$i6];
        $AjaxSql6 .= $or6;
        //ทำค่าส่งไปยัง Ajax
    }
    $TxtWkctr = " and  wkctr in ( ";
    $TxtWkctr .= $sqlStatus6;
    $TxtWkctr .= " ) ";
   // echo $TxtWkctr;
//ทำค่าส่งไปยัง Ajax
$Ajax6 = " and  wkctr in ( ";
$Ajax6 .= $AjaxSql6;
$Ajax6 .= " ) ";
//ทำค่าส่งไปยัง Ajax

}else {
    $TxtWkctr = "";
    $Ajax6 = "";
} // end

if(!empty($_POST["TxtTeam"])){
    $countArr7 =  count($_POST["TxtTeam"]);
    foreach($_POST["TxtTeam"] AS $i7 => $item7){
        if($i7 == $countArr7-1 ){
            $or7 = " ";
        }else{
            $or7 = ", ";
        }
        $ret7[] = "'".$item7 ."' ";        
        $sqlStatus7 .= $ret7[$i7];
        $sqlStatus7 .= $or7;

        //ทำค่าส่งไปยัง Ajax
        $AjaxRet7[] = "\'".$item7 ."\' ";
        $AjaxSql7 .= $AjaxRet7[$i7];
        $AjaxSql7 .= $or7;
        //ทำค่าส่งไปยัง Ajax
    }
    $TxtTeam = " and  team in ( ";
    $TxtTeam .= $sqlStatus7;
    $TxtTeam .= " ) ";
    //echo $TxtWkctr;

    //ทำค่าส่งไปยัง Ajax
    $Ajax7 = " and  team in ( ";
    $Ajax7 .= $AjaxSql7;
    $Ajax7 .= " ) ";
    //ทำค่าส่งไปยัง Ajax
}else {
    $TxtTeam = "";
    $Ajax7= "";
} // end

if(!empty($_POST["startD"]) && !empty($_POST["endD"]) ){
    $stD =   explode(".",$_POST["startD"]);
    $startD = mktime(0,0,0,$stD[1],$stD[0],$stD[2]);
    $enD =   explode(".",$_POST["endD"]);
    $endD = mktime(0,0,0,$enD[1],$enD[0],$enD[2]);

    $TxtstartD = " and ( ( bscstart between $startD and $endD ) or ( actfinish between $startD and $endD ) or ( cday between $startD and $endD )  ) ";
    //echo $TxtstartD;
}else {
    $TxtstartD = " and  ( ( bscstart between $startDayShow and $endDayShow ) or ( actfinish between $startDayShow and $endDayShow ) or ( cday between $startDayShow and $endDayShow ) ) ";
} // end

//************ หาค่า Search **************** */

$sql = "SELECT * FROM $tbl_policy where  ( `functionalloc`  like '%".$Factory_code."%')   $TxtActivity  $TxtType  $TxtProduct  $TxtEquipment $TxtStatus $TxtWkctr  $TxtstartD $TxtTeam order by bscstart DESC limit $numLM ";
$query = mysqli_query($link, $sql) or die ("Error Query [".$sql."]");
$num = mysqli_num_rows($query);  
//echo $sql;

$TxtKeyword =   $TxtActivity ." ". $TxtType ." ". $TxtProduct ." ". $TxtEquipment ." ". $TxtStatus ." ". $TxtWkctr ." ". $TxtstartD  ." ". $TxtTeam ." ";

// รวมคำค้นเพื่อส่งค่าไป Addplant
$TxtSearch = $Ajax1 ." ". $Ajax2 ." ". $Ajax3 ." ". $Ajax4 ." ". $Ajax5 ." ". $Ajax6 ." ". $Ajax7." ". $TxtstartD ; 
// รวมคำค้นเพื่อส่งค่าไป Addplant

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


<div class="container-fluid">
    <h1 class="mt-4"><?php echo $title_page;?></h1>
                       
    <div class="card mb-12">
        <div class="card-header alert-info">
		

<!--------- Search  Work Order ------------->
<div class="row">
      <div class="col-sm-10" >
      <i class="fas fa-table mr-1"></i> Filter <?php echo $title_page;?>
      <form class="form-inline" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>?module=<?PHP echo $module;?>" method="post" name="FrmSearch"  enctype="multipart/form-data" >
	<input type="hidden" id="module" name="module" value="<?PHP echo $module;?>" >
<div class="form-group mb-12">

	<label for="TxtActivity" class="alert alert-info" > &nbsp; Activity : &nbsp; </label>
	<?php 
		$sqlAT = " SELECT * From tbactivitytype order by mat ";
		$qrAT = mysqli_query($link, $sqlAT) or die ("Error Query [".$sqlAT."]");
		$numAT = mysqli_num_rows($qrAT);                                
	?>
	<select multiple class="selectpicker " id="TxtActivity[]" name="TxtActivity[]" data-container="body" data-live-search="true" title="Select Activity" data-hide-disabled="true" data-actions-box="true" data-virtual-scroll="true">
		<?PHP  
		   while($rsAT = mysqli_fetch_array($qrAT)){
			?>
				<option value="<?PHP  echo $rsAT["mat"];  ?>" > <?PHP  echo sprintf("%02d",$rsAT["mat"] ) ."=". $rsAT["matdescrip"];  ?>  </option>
    
		<?PHP        
		   } // end while($rsAT = mysqli_fetch_array($qrAT))
		?>                   
	</select>
	
</div> 
<div class="form-group">
   
	<label for="TxtType" class="alert alert-info"  >&nbsp; Type : &nbsp; </label>
	<?php 
		$sqlZB = " SELECT * From tbwkzb  order by wkzb ";
		$qrZB = mysqli_query($link, $sqlZB) or die ("Error Query [".$sqlZB."]");
		$numZB = mysqli_num_rows($qrZB);                                
	?>
	<select multiple class="selectpicker"   id="TxtType[]" name="TxtType[]" data-container="body" data-live-search="true" title="Select Type" data-hide-disabled="true" data-actions-box="true" data-virtual-scroll="true" >
		<?PHP  
		   while($rsZB = mysqli_fetch_array($qrZB)){
		    ?>
				<option value="<?PHP  echo $rsZB["wkzb"];  ?>" > <?PHP  echo $rsZB["wkzb"] ."=". $rsZB["zbdescrip"];  ?>  </option>
		
		<?PHP        
		   } // end while($rsAT = mysqli_fetch_array($qrAT))
		?>                   
    </select>

</div> 

<div class="form-group">

	<label for="TxtStatus" class="alert alert-info" > &nbsp; Status : &nbsp; </label>
	<?php 
		$sqlST = " SELECT * From tbwkstatus where not syst='MOVE OVER'  order by syst ";
		$qrST = mysqli_query($link, $sqlST) or die ("Error Query [".$sqlST."]");
		$numST = mysqli_num_rows($qrST);                                
	?>
	<select multiple class="selectpicker"   id="TxtStatus[]"  name="TxtStatus[]" data-container="body" data-live-search="true" title="Select Status" data-hide-disabled="true" data-actions-box="true" data-virtual-scroll="true" >		
        <?PHP  
       	while($rsST = mysqli_fetch_array($qrST)){
		?>
            <option value="<?PHP  echo $rsST["syst"];  ?>"  > <?PHP  echo $rsST["syst"];  ?> = <?PHP  echo  $rsST["wkstreason"];  ?>  </option>
        <?PHP   
		} // end while($rsAT = mysqli_fetch_array($qrAT))
		?>                   
	</select>

</div>     


<div class="form-group">

	<label for="TxtStatus" class="alert alert-info" > &nbsp; Resources  : &nbsp; </label>
	<?php 
		$sqlWK = " SELECT * From tbworkcenter  order by wkctr ";
		$qrWK = mysqli_query($link, $sqlWK) or die ("Error Query [".$sqlWK."]");
		$numWK = mysqli_num_rows($qrWK);                                
	?>
	<select multiple class="selectpicker"  id="TxtWkctr[]"  name="TxtWkctr[]" data-container="body" data-live-search="true" title="Select Reaources" data-hide-disabled="true" data-actions-box="true" data-virtual-scroll="true" >		
        <?PHP  
       	while($rsWK = mysqli_fetch_array($qrWK)){
		?>
            <option value="<?PHP  echo $rsWK["wkctr"];  ?>"  > <?PHP  echo $rsWK["wkctr"];  ?> = <?PHP  echo  $rsWK["namewkctr"] ." ".$rsWK["surnamewkctr"]  ;  ?>  </option>
        <?PHP   
		} // end while($rsAT = mysqli_fetch_array($qrAT))
		?>                   
	</select>
	
</div> 

<div class="form-group">

	<label for="TxtTeam" class="alert alert-info" >&nbsp; TEAM  : &nbsp; </label>
	<select  multiple class="selectpicker"  id="TxtTeam[]" name="TxtTeam[]"  data-container="body" data-live-search="true" title="Select Team" data-hide-disabled="true" data-actions-box="true" data-virtual-scroll="true"  >
		<option value="A" >A</option>
        <option value="B" >B</option>
        <option value="" >Null</option>
	</select>
	
</div> 


<div class="form-group">

	<label  for="TxtProduct" class="alert alert-info" >&nbsp; Product Line  : &nbsp; </label>
	<?php 
		$sqlFn = " SELECT * From tbfunctional  order by functionalloc ";
		$qrFn = mysqli_query($link, $sqlFn) or die ("Error Query [".$sqlFn."]");
		$numFn = mysqli_num_rows($qrFn);                                
	?>
	<select  multiple class="selectpicker"   id="TxtProduct[]" name="TxtProduct[]" onchange="ShowEquipment(this.value);"   title="Select Product Line" data-container="body" data-live-search="true" data-hide-disabled="true" data-actions-box="true" data-virtual-scroll="true" >
        <?PHP  
		   while($rsFn = mysqli_fetch_array($qrFn)){
			   ?>
				<option value="<?PHP  echo $rsFn["functionalloc"];  ?>" ><?PHP  echo $rsFn["functionalloc"];  ?> = <?PHP  echo  $rsFn["funldescrip"];  ?>  </option>
		<?PHP        
		   } // end while($rsAT = mysqli_fetch_array($qrAT))
		?>                   
	</select>
	
</div>
<div class="form-group" id="ShowEquipment" ></div>   


<div class="form-group">
	<label for="TxtProduct" class="alert alert-info" >&nbsp; วันที่ : &nbsp; </label>
    <input type="text" id="startD" name="startD" value="" style="border: none;height:45px ;"    title="dd.mm.YYYY" onkeyup="autoTab(this,1)" >
</div>

<div class="form-group">
	<label for="TxtProduct" class="alert alert-info" >&nbsp; ถึงวันที่ : &nbsp; </label>
    <input type="text" id="endD" name="endD" value="" style="border: none;height: 45px;"   title="dd.mm.YYYY" onkeyup="autoTab(this,1)" >
</div> 				   
						  
<button type="submit" class="btn btn-success"> Search </button>
</form>

      </div>
<div class="col-sm-2" style="background-color:#ffffff;" id="OrderDetail" >
<!----------------------- แสดงรายละเอียด Work Order --------------------->      
<?PHP  include_once("modalPages/FilterDetail.php"); ?>
<!----------------------- แสดงรายละเอียด Work Order --------------------->   	
</div>

<!--------------------แสดงคำค้น------------------------>
<div class="card-body" >

   Keyword : 
    <?PHP  if(!empty($sqlStatus1)){ echo  "<strong>Activity : </strong> ".  $sqlStatus1  . " &nbsp; " ;  }  ?>
    <?PHP  if(!empty($sqlStatus2)){ echo  "<strong>Type  :</strong> ". $sqlStatus2 . " &nbsp; " ;  }  ?>
    <?PHP  if(!empty($sqlStatus3)){ echo  "<strong>Product Line  : </strong> ". $sqlStatus3 . " &nbsp; " ;  }  ?>
    <?PHP  if(!empty(trim($sqlStatus4))  ){ echo  "<strong>Equipment  : </strong>". $sqlStatus4 . " &nbsp; " ;  }  ?>
    <?PHP  if(!empty($sqlStatus5)){ echo  "<strong>Status  :</strong> ". $sqlStatus5 . " &nbsp; " ;  }  ?>
    <?PHP  if(!empty($sqlStatus6)){ echo  "<strong>Resources  : </strong>". $sqlStatus6 . " &nbsp; " ;  }  ?>    
    <?PHP  if(!empty($sqlStatus7)){ echo  "<strong>TEAM  :</strong> ". $sqlStatus7 . " &nbsp; " ;  }  ?>
    <?PHP  if(!empty($startD) && !empty($endD) ){ echo  "<strong> Date  :</strong> ". date("d.m.Y", $startD) . " <strong> TO </strong>" . date("d.m.Y",$endD) ;  }  ?>
    
 </div>
<!--------------------แสดงคำค้น------------------------>

<!--------- Close Search  Work Order ------------->

<script>
function ShowEquipment(id){
    //alert(id);   
    var Events = [];
    Events[0] = id;
					
		//alert('selected ' + Events[0] );
		//Send Ajax On Select Table
		$.ajax({
		url: 'pages/select_equipment.php',
		type: "POST",
		data: {Event:Events },
			success: function(rep) {
			$("#ShowEquipment").html(rep);										
		}
	});		
	//Send Ajax On Select Table	
}
</script>

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


