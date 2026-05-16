<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.1/css/bootstrap-select.css" />
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.13.1/js/bootstrap-select.min.js"></script>


<form action="" method="GET">

  <select  multiple class="selectpicker"  id="st[]" name="st[]" data-container="body" data-live-search="true" title="Select Equipment" data-hide-disabled="true" data-actions-box="true" data-virtual-scroll="true"> 
               
  <option value="Mustard" >Mustard</option>
  <option value="Ketchup" >Ketchup</option>
  <option value="Relish">Relish</option>
</select>
    <button type="submit">Submit</button>
</form>

<?PHP 

    foreach($_GET[st] AS $i => $item){
        $ret[] = "result_$i\":\"$item";
        echo $ret[$i];
    }


 
 ?>

