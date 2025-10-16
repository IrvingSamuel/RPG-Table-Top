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
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contador</title>
    <script src="https://code.jquery.com/jquery-3.6.3.js" integrity="sha256-nQLuAZGRRcILA+6dMBOvcRh5Pe310sBpanc6+QBmyVM=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <style>
        body, html {
            height: 100%;
        }
        .bg-image {
            background-image: url(https://media.discordapp.net/attachments/1018942871434432603/1060274526023319603/Players.png?width=886&height=498);
            background-size: cover;
            background-repeat: no-repeat;
            backdrop-filter: blur(8px);
            -webkit-filter: blur(8px);

            /* Full height */
            height: 100%;
            position: fixed;
            left: 0; 
            right: 0;
        }
    </style>
</head>
<body>
    <div class="bg-image"></div>
    <div class="container-fluid row col-12" style="height: 100%;">
        <?php
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
    </div>
    

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" integrity="sha384-cuYeSxntonz0PPNlHhBs68uyIAVpIIOZZ5JqeqvYYIcEL727kskC66kF92t6Xl2V" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
    <script>
        <?php
            $strSQL = "SELECT * FROM players" ;
            $rs = mysqli_query($con,$strSQL);
            while($row = mysqli_fetch_array($rs)){
                $id = $row['id'];
        ?>let p<?php echo $id ;?>d = document.getElementById('p<?php echo $id ;?>d').value;
        let p<?php echo $id ;?>h = document.getElementById('p<?php echo $id ;?>h').value;
        let p<?php echo $id ;?>s = document.getElementById('p<?php echo $id ;?>s').value;
        let p<?php echo $id ;?>ms = document.getElementById('p<?php echo $id ;?>ms').value;
        var cdcp<?php echo $id ;?> = 0;
        let p<?php echo $id ;?>v = 0;

        <?php
            }
        ?>
        setInterval(function () {
            if(<?php
                    $strSQL = "SELECT * FROM players" ;
                    $rs = mysqli_query($con,$strSQL);
                    $cont = 0;
                    while($row = mysqli_fetch_array($rs)){
                        $id = $row['id'];
                        if($cont == 0){
                            echo "p".$id."v < 100 ";
                            $cont = 1;
                        }
                        else{
                            echo " && p".$id."v < 100 ";
                        }
                        
                
                    }
                ?>){
                <?php
                    $strSQL = "SELECT * FROM players" ;
                    $rs = mysqli_query($con,$strSQL);
                    while($row = mysqli_fetch_array($rs)){
                        $id = $row['id'];
                ?>    
                p<?php echo $id ;?>s = document.getElementById('p<?php echo $id ;?>s').value;
                p<?php echo $id ;?>h = document.getElementById('p<?php echo $id ;?>h').value;

                <?php
                    }
                ?>

                <?php
                    $strSQL = "SELECT * FROM players" ;
                    $rs = mysqli_query($con,$strSQL);
                    while($row = mysqli_fetch_array($rs)){
                        $id = $row['id'];
                ?>
                if(p<?php echo $id ;?>s <= (p<?php echo $id ;?>ms/4) && cdcp<?php echo $id ;?> != 2){
                    document.getElementById('p<?php echo $id ;?>h').value = p<?php echo $id ;?>h/4;
                    cdcp<?php echo $id ;?> = 2;
                }
                else if(p<?php echo $id ;?>s <= (p<?php echo $id ;?>ms/2) && cdcp<?php echo $id ;?> < 1){
                    document.getElementById('p<?php echo $id ;?>h').value = p<?php echo $id ;?>h/2;
                    cdcp<?php echo $id ;?> = 1;
                }
                if(p<?php echo $id ;?>s > 0){
                    p<?php echo $id ;?>v = p<?php echo $id ;?>v + p<?php echo $id ;?>d * p<?php echo $id ;?>h;
                }

                <?php
                    }
                ?>

                <?php
                    $strSQL = "SELECT * FROM players" ;
                    $rs = mysqli_query($con,$strSQL);
                    while($row = mysqli_fetch_array($rs)){
                        $id = $row['id'];
                ?>
                if(p<?php echo $id ;?>v >= 100){
                    p<?php echo $id ;?>v = 100;
                    console.log('Vez do player 1');
                    <?php echo ($admin == false) ? '' :  "$('#p".$id."a').prop('disabled', false);"; ?>
                    
                    $('div#p<?php echo $id ;?>b').css({'background-color': `green`});
                }
                $('div#p<?php echo $id ;?>b').css({'width': `${p<?php echo $id ;?>v}%`});

                <?php
                    }
                ?>
            }
        },100);
    </script>
</body>
</html>
<?php
    mysqli_close($con);
?>