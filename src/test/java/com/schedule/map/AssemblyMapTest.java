package com.schedule.map;

import com.schedule.entity.Assembly;
import org.hamcrest.Matchers;
import org.junit.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;

public class AssemblyMapTest {

    @Test
    public void testInputFileMap() throws IOException, URISyntaxException {
        AssemblyMap map = new AssemblyMap(getClass().getClassLoader().getResource("input2lines.txt").getPath());
        List<Assembly> assemblies = map.mapFileInputToAssembly();
        assertThat(assemblies, Matchers.hasSize(19));
        assertThat(assemblies.get(0).getMinutes(), Matchers.equalTo(60));
        assertThat(assemblies.stream().filter(e -> e.getName().contains("maintenance")).count(), Matchers.equalTo(1l));
    }

}
