<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bootstrap DatePicker</title>

</head>
<body>
<div class="col-lg-5">
        <label>Multiple (no virtualScroll)</label>
        <select multiple class="selectpicker form-control" id="number-multiple" data-container="body" data-live-search="true" title="Select a number" data-hide-disabled="true" data-actions-box="true" data-virtual-scroll="false">
        <?PHP  
            for($i=1;$i<=50;$i++){
        ?>
            <option value=""> Option <?PHP  echo $i ?> </option>
        <?PHP          
            }
        ?>
        </select>
      </div>




</body>
</html>
