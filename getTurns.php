<?php
    $DBSERVER = "sql586.main-hosting.eu"; // Database server
    $DBUSERNAME = 'u742768766_rootrtv'; // Database username
    $DBPASSWORD = "Tampama3,"; // Database password 
    $DBNAME = "u742768766_bdrtv"; // Database name
    
    /* connect to MySQL database */ 
    $con = mysqli_connect($DBSERVER, $DBUSERNAME, $DBPASSWORD, $DBNAME);
    
    // Check db connection
    if (!$con) {
        die("Connection failed: " . mysqli_connect_error());
    }
    $admin = false;
    if(isset($_GET['admin'])){
        $admin = true;
    }
    $strSQL = "SELECT * FROM players ORDER BY nome ASC" ;
    $rs = mysqli_query($con,$strSQL);
    while($row = mysqli_fetch_array($rs)){
        $id = $row['id'];
        $nome = $row['nome'];
        $foto = $row['foto'];
        $destreza = $row['destreza'];
        $stamina = $row['stamina'];
?>
<div class="d-flex align-items-center col-md-12 col-sm-12 col-lg-2">
    <div class="card" style="width: 100%">
        <img src="<?php echo $foto ;?>" class="card-img-top" alt="...">
        <div class="card-body">
            <div class="d-flex justify-content-between" style="max-width: 100%; margin-bottom: 10px;">
                <h5 class="card-title"><?php echo $nome ;?></h5>
                <button class="btn btn-secondary" id="p<?php echo $id ;?>a" type="button" style="font-size: 15px;" onclick="(p<?php echo $id ;?>v=0);$('#p<?php echo $id ;?>a').prop('disabled', true);$('div#p<?php echo $id ;?>b').css({'background-color': `blue`});" disabled>Ação</button>
            </div>
            <div style="width: 100%; height: 20px; border: 1px solid black; margin-bottom: 10px;">
                <div id="p<?php echo $id ;?>b" style="width: 0px; height: 20px; background-color: blue;"></div>
            </div>
            <div style="width: 100%;">
                <p class="card-text">
                    <div class="d-flex flex-column justify-content-between">
                        <li class="d-flex justify-content-between">
                            <div>
                                <b>Destreza:</b>
                            </div>
                            <div><?php echo $destreza ;?><input disabled id="p<?php echo $id ;?>d" type="number" hidden value="<?php echo $destreza ;?>"></div>
                        </li>
                        <li class="d-flex justify-content-between">
                            <div>
                                <b>Stamina:</b>
                            </div>
                            <div style="width: 50%;"><input <?php echo ($admin == false) ? 'disabled' : ''; ?> id="p<?php echo $id ;?>s" type="number" value="<?php echo $stamina ;?>" min="0" max="<?php echo $stamina ;?>" step="1" style="width: 55%;"> / <?php echo $stamina ;?><input disabled id="p<?php echo $id ;?>ms" type="number" hidden value="<?php echo $stamina ;?>"></div>
                        </li>
                        <li class="d-flex justify-content-between">
                            <div><b>H.A.S.T.E.:</b>
                            </div>
                            <div style="width: 50%;">
                                <input <?php echo ($admin == false) ? 'disabled' : ''; ?> id="p<?php echo $id ;?>h" type="number" value="1" min="0" max="2" step="0.1" style="width: 100%;">
                            </div>
                        </li>
                    </div>
                </p>
            </div>
        </div>
    </div>
</div>
<?php
    }
?>