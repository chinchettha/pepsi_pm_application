<?PHP
 include('connection.php');
 $SQL = "SELECT * FROM  tbiw37n  where mntplan like '%.00' ";
 $qr = mysqli_query($link, $SQL) or die ("Error Query [".$SQL."]");        
 $num = mysqli_num_rows($qr);
 if($num > 0){
    while($result = mysqli_fetch_array($qr))
    {
        $newMnt =  str_replace(".00","",$result["mntplan"]);
        //update
        $SQLup = " UPDATE `tbiw37n` SET `mntplan`='".$newMnt."' WHERE (`idiw37`='".$result["idiw37"]."') ";
        $qrUP = mysqli_query($link, $SQLup) or die ("Error Query [".$SQLup."]");
        if($qrUP>0){
            echo $SQLup ."<br>";
        }
        //update
    }
 }
    
?>