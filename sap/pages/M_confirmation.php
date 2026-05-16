<?PHP
$title_page = "Confirmation By Work Order";
$tbl_policy = "view_confirm";
$myfile = "M_confirmation";
?>
<!------------ autocomplete   -------------->
<script type="text/javascript" src="js/autocomplete.js?02072019 "></script>
<link rel="stylesheet" href="js/autocomplete.css"  type="text/css"/>
<!------------ autocomplete   -------------->

<div class="container-fluid">
    <h1 class="mt-4"><?php echo $title_page?></h1>
    <ol class="breadcrumb mb-4">
        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
        <li class="breadcrumb-item active"><?php echo $title_page?></li>
    </ol>
    <div class="card mb-4">

</div>
<div class="card mb-4">
    <div class="card-header">
		<i class="fas fa-table mr-1"></i> Confirmation
		<div class="float-right">		
	</div>
</div>
<div class="card-body">

<div class="container-fluid">
	<form  action="" method="post"  class="was-validated" onsubmit="return chk('#ShowOrder',wkorder.value)" >
	<div class="input-group mb-3">
    	<div class="input-group-prepend">
      		<button class="btn btn-outline-primary" type="button">Number Work Order </button>  
    	</div>
        <input type="number" id="wkorder" name="wkorder" class="form-control" placeholder="Enter Work Order" data-toggle="tooltip"  data-placement="top" title="Work Order"   required autofocus>
        <input name="h_province_id" type="hidden" id="h_province_id" value="" />
		<div class="input-group-append">
      		<button class="btn btn-success" type="button" onclick="return ShowAjax('#ShowOrder',wkorder.value)" >  Go  </button>  
     	</div>
	  </div>
	</form>
	<div class="container-fluid" id="ShowOrder" ></div>
</div>

</div>

<script>

function chk(div,val){ //รับค่าการกดปุ่ม  Enter
    //alert(div);
	var Events = [];
	Events[0] = val;

	//Send Ajax On Select Table					
	$.ajax({
		url: 'pages/M_confirmation_form.php',
		type: "POST",
		data: {Event:Events },
		success: function(rep) {							
			$(div).html(rep);
			exit;
		}
	});						
	//Send Ajax On Select Table	
    return false;
}    //รับค่าการกดปุ่ม  Enter

function ShowAjax(div,val){ // ShowAjax(div id ,value )
	//alert(div);
	var Events = [];
	Events[0] = val;

	//Send Ajax On Select Table					
	$.ajax({
		url: 'pages/M_confirmation_form.php',
		type: "POST",
		data: {Event:Events },
		success: function(rep) {							
			$(div).html(rep);
			exit;
		}
	});						
	//Send Ajax On Select Table	
} // ShowAjax(div id ,value )
</script>


<!------------ autocomplete   -------------->
<script type="text/javascript">
function make_autocom(autoObj,showObj){
    var mkAutoObj=autoObj; 
    var mkSerValObj=showObj; 
    new Autocomplete(mkAutoObj, function() {
        this.setValue = function(id) {      
            document.getElementById(mkSerValObj).value = id;
        }
        if ( this.isModified )
            this.setValue("");
        if ( this.value.length < 1 && this.isNotClick ) 
            return ;    
        return "modalPages/autocomplete.php?q=" +encodeURIComponent(this.value);
    }); 
}   
   
// การใช้งาน
// make_autocom(" id ของ input ตัวที่ต้องการกำหนด "," id ของ input ตัวที่ต้องการรับค่า");
make_autocom("wkorder","h_province_id");
</script>
<!------------ autocomplete   -------------->