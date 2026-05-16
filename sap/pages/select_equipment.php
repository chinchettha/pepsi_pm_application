<?PHP 
session_start();

/**************
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/


header ("Last-Modified: " . gmdate ("D, d M Y H:i:s") . " GMT");

   // Include File connect Database
   date_default_timezone_set("Asia/Bangkok");
   require_once('../include/connection.php');
   require_once('../include/define.php');
   $Events = $_REQUEST["Event"];
   $id = $Events[0];

?>
<!-- JavaScript -->



<div class="form-group">
<label for="TxtEquipment" class="alert alert-info"  >&nbsp; Equipment : &nbsp; </label>
    <?php 
        $sqlEq = " SELECT * From tbequipment where functionalloc = '$id'  order by equipment ";
        $qrEq = mysqli_query($link, $sqlEq) or die ("Error Query [".$sqlEq."]");
        $numEq = mysqli_num_rows($qrEq);      
       // echo $sqlEq;                          
    ?>
       
       <select  multiple class="selectpicker"  id="TxtEquipment[]" name="TxtEquipment[]" data-container="body" data-live-search="true" title="Select Equipment" data-hide-disabled="true" data-actions-box="true" data-virtual-scroll="true"> 
            <?PHP  
            if($numEq>0){
            while($rsEq = mysqli_fetch_array($qrEq)){
            ?>   
                <option value="<?PHP  echo $rsEq["equipment"];  ?>" ><?PHP  echo $rsEq["equipment"];  ?> = <?PHP  echo  $rsEq["equdescrip"];  ?>  </option>
            <?PHP 
            //หา sub Equipment
            $sqlEqs = " SELECT * from tbequipment where equipmentsub = '".$rsEq["equipment"]."' ";
            $qrEqs = mysqli_query($link, $sqlEqs) or die ("Error Query [".$sqlEqs."]");
            $numEqs = mysqli_num_rows($qrEqs);      
            if($numEqs>0){
                while($rsEqs = mysqli_fetch_array($qrEqs)){
                ?>
                <option value="<?PHP  echo $rsEqs["equipment"];  ?>" ><?PHP  echo $rsEqs["equipment"];  ?> =  <?PHP  echo  $rsEqs["equdescrip"];  ?>
                <?PHP     
                //หา sub Equipment 2
                $sqlEqs2 = " SELECT * from tbequipment where equipmentsub = '".$rsEqs["equipment"]."' ";
                $qrEqs2 = mysqli_query($link, $sqlEqs2) or die ("Error Query [".$sqlEqs2."]");
                $numEqs2 = mysqli_num_rows($qrEqs2);      
                if($numEqs2>0){
                    while($rsEqs2 = mysqli_fetch_array($qrEqs2)){
                    ?>
                        <option value="<?PHP  echo $rsEqs2["equipment"];  ?>" ><?PHP  echo $rsEqs2["equipment"];  ?> = 3 <?PHP  echo  $rsEqs2["equdescrip"];  ?>
                    <?PHP     
                    } //end while
                } // end if 
                //หา sub Equipment 2
                } //end while
            } // end if 
            //หา sub Equipment
        ?>
        
        <?PHP        
        } // end while($rsAT = mysqli_fetch_array($qrAT))
    }else{
        ?>
        <option value=""> ไม่พบข้อมูล </option>
    <?PHP 
    }
    ?>                   
</select>
    </div>

  
    <script src="js/bootstrap-select.js"></script>

<script type="text/javascript">
    $('.selectpicker').selectpicker({
      });
</script>