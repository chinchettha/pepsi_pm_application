<?PHP
$title_page = "Confirmation By Work Order";
$tbl_policy = "view_confirm";
$myfile = "M_confirmation";
?>

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

<div class="container">
	<form  action="#" method="POST"  class="was-validated">
	<div class="input-group mb-3">
    	<div class="input-group-prepend">
      		<button class="btn btn-outline-primary" type="button">Number Work Order </button>  
    	</div>
		<input type="number" id="wkorder" name="wkorder" class="form-control" placeholder="Enter Work Order" data-toggle="tooltip"  data-placement="top" title="Work Order" onkeydown="return key13();"    required autofocus>
		<div class="input-group-append">
      		<button class="btn btn-success" type="submit" onclick="return ShowAjax('#ShowOrder',wkorder.value)" >  Go  </button>  
     	</div>
	  </div>
	</form>
	<div  id="ShowOrder" ></div>
</div>

</div>

<script>

function key13(){  //รับค่าการกดปุ่ม  Enter
	//alert ("fsd");
$(document).ready(function() {
  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return ShowAjax('#ShowOrder',wkorder.value);
	  return false;	  
    }
  });
});
} //รับค่าการกดปุ่ม  Enter


function ShowAjax(div,val){ // ShowAjax(div id ,value )
	//alert(div);
	var Events = [];
	Events[0] = val;

	//Send Ajax On Select Table					
	$.ajax({
		url: 'pages/W_confirmation_form.php',
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
