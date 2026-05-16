<div class="container my-4">

<!--------  ฟอร์ม Close confrim ----------->
<?PHP
	if(trim($rsTB1["syst"]) == "CRTD" || trim($rsTB1["syst"]) == "REL"  ){
?>

<h5>แทรกภาพถ่ายจากอุปกรณ์</h5>
<form name="frmMainimg" id="frmMainimg" enctype="multipart/form-data" >
<input type="hidden" id="op" name="op" value="insert_img">
<input type="hidden"  id="idiw37" name="idiw37" value="<?PHP echo  $rsTB1["idiw37"];?>">

<div class="input-group mb-3">
    	<div class="input-group-prepend">
      		<button class="btn btn-outline-primary" type="button">คำอธิบายภาพ </button>  
    	</div>
		<input type="text" id="cimgcom" name="cimgcom" class="form-control" placeholder="คำอธิบายประกอบรูปภาพ " data-toggle="tooltip"  data-placement="top" title="คำอธิบายภาพ" >

	  </div>

<div class="input-group   mb-3">
<div class="input-group-prepend custom-file">
    <input type="file" class="custom-file-input" id="fileUpload" name="fileUpload">
    <label class="custom-file-label" for="customFile">Choose file</label>
</div>
<div class="input-group-prepend">
      <button type="submit" class="btn btn-primary"><i class="fa fa-upload" aria-hidden="true"></i> UPLOAD</button>
</div>
</div>
</form>
<?PHP  
		} // end if(trim($rsTB1["syst"]) == "CRTD" || trim($rsTB1["syst"]) == "REL"  ){
?>
<!-------- ปิด ฟอร์ม Close confrim ----------->

<div id="ShowImg">
   <?PHP  include_once("plan_ShowImgUpload_close.php"); ?>
</div>

</div>
<script>
// Add the following code if you want the name of the file appear on select
$(".custom-file-input").on("change", function() {
  var fileName = $(this).val().split("\\").pop();
  $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});
</script>

<script type="text/javascript">
        $(document).ready(function () {
            $("#frmMainimg").on("submit", function (event) {
                event.preventDefault(); //prevent default submitting
                var formData = new FormData($(this)[0]);
                $.ajax({
                    url: "modalPages/plan_submit_upload_file.php",
                    type: "post",
                    data: formData,
                    processData: false, //Not to process data
                    contentType: false, //Not to set contentType
                    success: function (data) {
                       // alert(data);
                        $("#ShowImg").html(data);      
                    }
                });
            });
        });
    </script>

<script>
function DelImg(div,val,op,idiw37){ // ShowAjax(div id ,value , Option , idiw37)
	//alert(div);
	var Events = [];
	Events[0] = val;
    Events[1] = op;
    Events[2] = idiw37;
  	//Send Ajax On Select Table					
	$.ajax({
		url: 'modalPages/plan_submit_upload_file.php',
		type: "POST",
		data: {Event:Events },
		success: function(rep) {							
			$(div).html(rep);
		}
	});						
	//Send Ajax On Select Table	
} // ShowAjax(div id ,value )
</script>    